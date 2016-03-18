/* global Router */

Router.configure({layoutTemplate: 'main', notFoundTemplate: 'error_page'});

//Router.route('/', {
//	name: 'downtimeNotify',
//	template: 'downtimeNotify'
//});

//Router.route('/asdfghhome/', {
//	template: 'home',
//	waitOn: function () {
//		return Meteor.subscribe("userdata", Meteor.userId());
//	}
//});

//Router.route('/create/:_id', {
//	template: 'downtimeNotify',
//	waitOn: function () {
//		return Meteor.subscribe("userdata", Meteor.userId());
//	}
//});
//
//Router.route('/createMindmap/:_id', {
//	name: "create",
//	template: "create",
//	waitOn: function () {
//		Meteor.subscribe("userdata");
//		return Meteor.subscribe("mindmap", this.params._id);
//	}, 
//	data: function () {
//		return {id: this.params._id, data: mindMapService.findTree(this.params._id)};
//	}
//});


var IS_IPAD = navigator.userAgent.match(/iPad/i) != null,
    IS_IPHONE = !IS_IPAD && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null)),
    IS_IOS = IS_IPAD || IS_IPHONE;

var checkPlatform = function() {
  if(IS_IOS) {
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
		var self = this;
		App.isSharedMindmap = null;
		if (!Meteor.user()) {
			self.render("home");
		}
		else {
			Meteor.subscribe("userdata", Meteor.userId());
            Meteor.subscribe("myRootNodes", Meteor.user().services.google.email);
            Meteor.subscribe("acl",Meteor.user().services.google.email);
			self.render("dashboard");
		}
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

			self.render("create");
		}
	},
	data: function () {
		console.log("in create;");
		return {id: this.params._id, data: mindMapService.findTree(this.params._id)};
	},
	waitOn: function () {
		Meteor.subscribe("userdata");
		console.log("Before call:",this.params._id);
		App.currentMap = this.params._id;
		var user = Meteor.user() ? Meteor.user().services.google.email : "*";
			Meteor.call("isWritable", this.params._id, user, function (error, value) {
				console.log("error...",error,value);
				App.editable = value;

			});
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

Router.route('/sharedLink/:link',{
	name: 'share',
	template: 'create',
	onBeforeAction: function(){
			App.temp = this.data();
			console.log("In onBeforAction:", App.temp);
			var doc = MindmapMetadata.findOne({readOnlyLink: "www.mindit.xyz/sharedLink/" + this.params.link});
			if (doc) {
				console.log("in read....");
				App.isSharedMindmap = App.Constants.Mode.READ;
				this.render("create");

				//Router.go('/create/'+doc.rootId);
			}
			else {
				doc = MindmapMetadata.findOne({readWriteLink: "www.mindit.xyz/sharedLink/" + this.params.link});
				if (doc) {
					console.log("in write......");
					App.isSharedMindmap = App.Constants.Mode.WRITE;
					App.editable = true;
					this.render("create");

					////
				}
				else
					this.render("error_page");

			}
	},
	waitOn :function(){
		console.log("in waiton........");
		Meteor.subscribe("userdata");
		var user = Meteor.user() ? Meteor.user().services.google.email : "*";
		var isSharedMindmap = true;
		Meteor.call("getRootNodeFromLink","www.mindit.xyz/sharedLink/"+this.params.link, function(error, value) {
			console.log("in the call..");
			App.currentMap = value;
			Meteor.subscribe("mindmap", value, user,true);
		});
		return Meteor.subscribe("MindmapMetadata", "www.mindit.xyz/sharedLink/"+this.params.link);

	},
	data: function () {
		console.log("in share",App.currentMap);
		return {id: App.currentMap, data: mindMapService.findTree(App.currentMap)};
	}



});

