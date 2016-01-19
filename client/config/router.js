/* global Router */

Router.configure({layoutTemplate: 'main', notFoundTemplate: 'error_page'});

Router.route('/', {
	onBeforeAction: function (pause) {
		if (!Meteor.user())
			this.render('home');
		else {
			Meteor.subscribe("userdata", Meteor.userId());
			Meteor.subscribe("myPermissions", Meteor.userId());
			Meteor.subscribe("myRootNodes", Meteor.userId());
			this.render('dashboard');
		}
	}
});
Router.route('/create/:_id', {
	name: "create",
	template: "create",
	waitOn: function () {
		Meteor.subscribe("userdata");
		return Meteor.subscribe("mindmap", this.params._id);
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
