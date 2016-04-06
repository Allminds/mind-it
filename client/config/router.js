
Router.configure({layoutTemplate: 'main', notFoundTemplate: 'error_page'});

var IS_IPAD = navigator.userAgent.match(/iPad/i) != null,
    IS_IPHONE = !IS_IPAD && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null)),
    IS_IOS = IS_IPAD || IS_IPHONE;

var checkPlatform = function () {
    if (IS_IOS) {
        var address = window.location.href
        var elements = address.split('/')
        var id = elements[elements.length - 1]
        window.location.assign("mindit.xyz://create/" + id)
    }
}

checkPlatform()

App.ERROR_MESSAGE = "Page Not Found";



Router.route('/', {
	onBeforeAction: function () {
		renderHomePage.call(this);
	}
});

Router.route('/create/:_id', {
	name: "create",
	template: "create",
	onBeforeAction: function () {
		var self = this;
		var error_msg;
		if(mindMapService.findTree(this.params._id).length == 0) {
			Meteor.call("isInvalidMindmap",this.params._id , function(error , result) {
				if(result == true) {
					error_msg = "Invalid Mindmap";
					App.ERROR_MESSAGE = error_msg;
					self.render("error_page");
				}
				else {
					error_msg = "Inaccessible Mindmap";
					App.ERROR_MESSAGE = error_msg;
					if(!Meteor.user()) {
						self.render("login_loading_page");

					}else{
						self.render("error_page");
					}
				}
			})
		}
		else {
			//var user = Meteor.user() ? Meteor.user().services.google.email : "*";
            console.log("before rendering");
            self.render("create");
		}
	},
	data: function () {
		return {id: this.params._id, data: mindMapService.findTree(this.params._id)};
	},
	waitOn: function () {
		Meteor.subscribe("userdata");
		App.currentMap = this.params._id;
		Meteor.subscribe("onlineusers",this.params._id);
		var user = Meteor.user() ? Meteor.user().services.google.email : "*";
		Meteor.call("isWritable", this.params._id, user, function (error, value) {
			App.editable = value;
		});
        console.log("before subscription");
		return Meteor.subscribe("mindmap", this.params._id, user);

	}

});

Router.route('(/404)|/(.*)', {
    name: 'error_page',
    template: 'error_page',
    onBeforeAction: function () {
        App.isSharedMindmap = null;
    }
});

Router.route('/sharedLink/:link', {
    name: 'share',
    template: 'create',
    onBeforeAction: function () {
        var self = this;
        //App.currentMap = this.data();
        var doc = MindmapMetadata.findOne({readOnlyLink: "sharedLink/" + this.params.link});
        if (doc) {
            App.isSharedMindmap = App.Constants.Mode.READ;
            setTimeout(function () {
                    self.render("create");
            }, 2000);
        }
        else {
            doc = MindmapMetadata.findOne({readWriteLink: "sharedLink/" + this.params.link});
            if (doc) {
                App.isSharedMindmap = App.Constants.Mode.WRITE;
                App.editable = true;
                if (!Meteor.user()) {
                    self.render("login_loading_page");

                } else {
                    setTimeout(function () {
                        self.render("create");
                    }, 2000);
                }
            }
            else
                this.render("error_page");
        }
    },
    waitOn: function () {
        Meteor.subscribe("userdata");
        var user = Meteor.user() ? Meteor.user().services.google.email : "*";
        var isSharedMindmap = true;
        var link = this.params.link;

        Meteor.call("getRootNodeFromLink", "sharedLink/" + this.params.link, function (error, value) {
            App.currentMap = value.rootId;
            var mode = App.Constants.Mode.READ;
            if(value.readWriteLink == "sharedLink/" + link){
                mode = App.Constants.Mode.WRITE;
            }
            Meteor.subscribe("mindmap", App.currentMap, user, mode);
            Meteor.subscribe("onlineusers", App.currentMap);

        });
        return Meteor.subscribe("MindmapMetadata", "sharedLink/" + this.params.link);

    },
    data: function () {


        return {id: App.currentMap, data: mindMapService.findTree(App.currentMap)};
    }

});

function renderHomePage() {
    var self = this;
    App.isSharedMindmap = null;
    if (!Meteor.user()) {
        self.render("home");
    }
    else {
        Meteor.subscribe("userdata", Meteor.userId());
        Meteor.subscribe("myRootNodes", Meteor.user().services.google.email);
        Meteor.subscribe("acl", Meteor.user().services.google.email);
        //Changing current mindmap id to "*", since user isnt on any specific mindmap.
        self.render("dashboard");
        Meteor.call("updateUserStatus", Meteor.user().services.google.email, "*");
    }
}
