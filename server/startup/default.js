Meteor.publish('mindmaps', function () {
	return Mindmaps.find();
});