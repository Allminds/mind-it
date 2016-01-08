/* global Router */
Router.configure({layoutTemplate: 'main'});
Router.route('/', {
	template: 'home',
	waitOn: function () {
		return Meteor.subscribe("userdata", Meteor.userId());
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
Router.route('/404', {
	name: 'error_page',
	template: 'error_page'
});
