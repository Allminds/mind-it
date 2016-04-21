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
App.isPublicMindMap;

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
        if (mindMapService.findTree(this.params._id).length == 0 || Mindmaps.find({rootId:null}).count() == 0) {
            Meteor.call("isInvalidMindmap", this.params._id, function (error, result) {
                if (result == true) {
                    error_msg = "Invalid Mindmap";
                    App.ERROR_MESSAGE = error_msg;
                    self.render("error_page");
                }
                else {
                    error_msg = "Inaccessible Mindmap";
                    App.ERROR_MESSAGE = error_msg;
                    if (!Meteor.user()) {
                        self.render("login_loading_page");

                    } else {
                        self.render("error_page");
                    }
                }
            })
        }
        else {
            self.render("create");
        }
    },
    data: function () {
        return {id: this.params._id, data: mindMapService.findTree(this.params._id)};
    },
    waitOn: function () {
        Meteor.subscribe("userdata");
        App.currentMap = this.params._id;
        Meteor.subscribe("onlineusers", this.params._id);
        var user = getMeteorUser();

        Meteor.call("isWritable", this.params._id, user, function (error, value) {
            App.editable = value;
        });
        Meteor.call("isPublicMindmap", App.currentMap, function (error, value) {
            App.isPublicMindMap = value;
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
Router.route('/sharedLink/:link', {
    name: 'share',
    template: 'create',
    onBeforeAction: function () {
        var self = this;
        setTimeout(function () {
            if (App.isSharedMindmap == App.Constants.Mode.READ) {
                self.render("create");
            }
            else {
                if (App.isSharedMindmap == App.Constants.Mode.WRITE) {
                    App.editable = true;

                    if (!Meteor.user() && App.isPublicMindMap == false) {

                        self.render("login_loading_page");

                    } else {
                        self.render("create");
                    }

                }
                else
                    this.render("error_page");

            }
        }, 2000);

    },
    waitOn: function () {
        Meteor.subscribe("userdata");
        var user = getMeteorUser();
        var isSharedMindmap = true;
        var link = this.params.link;

        Meteor.call("getRootNodeFromLink", "sharedLink/" + this.params.link, function (error, value) {
            App.currentMap = value.rootId;
            App.isSharedMindmap = App.Constants.Mode.READ;

            if (value.readWriteLink == "sharedLink/" + link) {
                App.isSharedMindmap = App.Constants.Mode.WRITE;
            }
            Meteor.subscribe("mindmap", App.currentMap, user, App.isSharedMindmap);
            Meteor.subscribe("onlineusers", App.currentMap);
            Meteor.call("isPublicMindmap", App.currentMap, function (error, value) {
                App.isPublicMindMap = value;
            });

        });


        return Meteor.subscribe("mindmap", App.currentMap);


    },
    data: function () {
        return {id: App.currentMap, data: mindMapService.findTree(App.currentMap)};
    }

});
Router.route('/embed/:link', {
    name: 'embed',
    template: 'create',
    onBeforeAction: function () {
        var self = this;
        setTimeout(function () {
            self.render("create");
        }, 2000);

    },
    waitOn: function () {
        var self = this;
        Meteor.call("getRootNodeFromLink", "sharedLink/" + self.params.link, function (error, value) {
            console.log("Value",value);
            App.currentMap = value.rootId;
            App.isSharedMindmap = App.Constants.Mode.READ;
            App.isPublicMindMap = true;
            Meteor.subscribe("mindmap", App.currentMap, "*", App.isSharedMindmap);
        });
        return Meteor.subscribe("mindmap", App.currentMap);
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
        self.render("dashboard");
    }
}

function getMeteorUser() {
    var user = "*";
    if (Meteor.user()) {
        var temp = Meteor.user().services;
        if (temp)
            user = temp.google.email;
    }
    return user;
}
