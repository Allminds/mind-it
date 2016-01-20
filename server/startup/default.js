mindMapService = App.MindMapService.getInstance();
Meteor.publish('mindmap', function (id) {
  return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});
});
Meteor.publish('userdata', function () {
  return Meteor.users.find(this.userId);
});
Meteor.publish('myRootNodes', function(emailId) {
  return App.DbService.rootNodesOfMyMaps(emailId);
});
Meteor.publish('myPermissions', function(emailId) {
  var myPermissions = App.DbService.myPermissions(emailId);
  return myPermissions;
});
Meteor.methods({
  //Only Meteor can delete the documents - Not permitted for client
  deleteNode: function (id) {
    mindMapService.deleteNode(id);
  },

  countMaps: function () {
    return Mindmaps.find({parentId: null}).count();
  },
  addMapToUser: function(emailId, mindMapId, permisson) {
    App.DbService.addUser(emailId, mindMapId, permisson);
  }

});