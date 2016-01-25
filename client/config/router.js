/* global Router */

Router.configure({layoutTemplate: 'main', notFoundTemplate: 'error_page'});

Router.route('/', {
	onBeforeAction: function () {
		var self = this;
		if (!Meteor.user()) {
			self.render("home");
		}
		else {
			Meteor.subscribe("userdata", Meteor.userId());
			Meteor.subscribe("myPermissions", Meteor.user().services.google.email);
            Meteor.subscribe("myRootNodes", Meteor.user().services.google.email);
			self.render("dashboard");
		}
	}
});
Router.route('/create/:_id', {
	name: "create",
	template: "create",
	waitOn: function () {
		Meteor.subscribe("userdata");
		var user = Meteor.user() ? Meteor.user().services.google.email : "*";
		return Meteor.subscribe("mindmap", this.params._id, user);
	},
	data: function () {
		return {id: this.params._id, data: mindMapService.findTree(this.params._id)};
	}
});
Router.route('(/404)|/(.*)', {
	name: 'error_page',
	template: 'error_page',
	waitOn: function () {
		return Meteor.subscribe("userdata", Meteor.userId());
	}
});
