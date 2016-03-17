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
		console.log("on before action");
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
		return {id: this.params._id, data: mindMapService.findTree(this.params._id)};
	},
	waitOn: function () {
		Meteor.subscribe("userdata");
		var user = Meteor.user() ? Meteor.user().services.google.email : "*";
		Meteor.call("isWritable", this.params._id, user, function(error, value) {
			App.editable = value;
			console.log(" in router renderd:",App.editable);

		});
		return Meteor.subscribe("mindmap", this.params._id, user);
	}

});


Router.route('(/404)|/(.*)', {
	name: 'error_page',
	template: 'error_page',
	//waitOn: function () {
	//	return Meteor.subscribe("userdata", Meteor.userId());
	//}
});