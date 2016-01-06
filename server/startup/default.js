mindMapService = App.MindMapService.getInstance();
Meteor.publish('mindmap', function (id) {
  return Mindmaps.find({$or: [{_id: id}, {parent_ids: id}]});
});
Meteor.publish('userdata', function () {
  return Meteor.users.find(this.userId);
});
Meteor.methods({
  deleteNode: function (id) {
    //Meteor._sleepForMs(500);
    mindMapService.deleteNode(id);
  },

  countMaps: function () {
    return Mindmaps.find({position: null}).count();
  }
});