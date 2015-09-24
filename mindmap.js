/* global d3 */
/* global Router */
/* global Template */
/* global SessionCounter */
/* global Meteor */

Mindmaps = new Meteor.Collection("Mindmaps");
var mindMapService;
Router.configure({ layoutTemplate: 'main' });
Router.route('/', { template: 'home' });
Router.route('/create/:_id', function () {
	this.render('create', {
		data: function () {
			return Mindmaps.findOne(this.params._id);
		}
	});
});

if (Meteor.isClient) {
	// counter starts at 0
	Template.create.rendered = function () {
		var base = d3.select("#mindmap"),
			canvas = base.append("canvas").attr("width", '1000').attr("height", 800);
	}
	mindMapService = new MindMapService();
	Template.MyButton.events({
		'click #clickme': function () {
			// 1. cretate root node with defualt title
			var mindMapId = mindMapService.createNode('New Mindmap'),
				link = '/create/' + mindMapId;
			// 2. Go to canvas root note
			Router.go(link);
		}
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}
