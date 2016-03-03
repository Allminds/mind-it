mindMapService = App.MindMapService.getInstance();
Meteor.publish('mindmap', function (id) {
   return Mindmaps.find({$or:[{_id:id},{rootId:id}]});
});
Meteor.publish('userdata', function () {
  return Meteor.users.find(this.userId);
});
Meteor.publish('MindmapCommands', function (mindmapId) {
  return MindmapCommands.find({rootId:mindmapId});
});
Meteor.methods({
  //Only Meteor can delete the documents - Not permitted for client
  deleteNode: function (id) {
    mindMapService.deleteNode(id);
  },

  countMaps: function () {
    return Mindmaps.find({parentId: null}).count();
  },
  countNodes: function() {
     return Mindmaps.find({}).count();
  },
  findTree: function (id) {
    return mindMapService.findTree(id);
  }
});
