mindMapService = App.MindMapService.getInstance();
Meteor.publish('mindmap', function (id) {
  return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});
});
Meteor.publish('userdata', function () {
  return Meteor.users.find(this.userId);
});
Meteor.publish('myRootNodes', function(userId) {
  return App.DbService.rootNodesOfMyMaps(userId);
});
Meteor.publish('myPermissions', function(userId) {
  return App.DbService.myPermissions(userId);
});
Meteor.methods({
  //Only Meteor can delete the documents - Not permitted for client
  deleteNode: function (id) {
    mindMapService.deleteNode(id);
  },

  countMaps: function () {
    return Mindmaps.find({parentId: null}).count();
  },
  addMapToUser: function(userId, mindMapId) {
    App.DbService.addOwner(userId, mindMapId);
  }
});