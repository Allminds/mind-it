/* global MindMapService */
/* global Router */
/* global mindMapService */
mindMapService = new MindMapService();
Template.MyButton.events({
	'click #clickme': function () {
		// 1. cretate root node with defualt title
		var mindMapId = mindMapService.createRootNode('New Mindmap'),
			link = '/' + mindMapId;
		// 2. Go to canvas root note
		Router.go(link);
	}
});