mindMapService = new MindMapService();
Meteor.publish('mindmaps', function () {
	return Mindmaps.find();
});
Meteor.methods({
	deleteNode: function(id){
		mindMapService.deleteNode(id);
	}
})