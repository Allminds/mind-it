mindMapService = App.MindMapService.getInstance();
Meteor.publish('mindmap', function (id) {
  return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});
});
Meteor.publish('userdata', function () {
  return Meteor.users.find(this.userId);
});
Meteor.publish('myRootNodes', function(userId) {
  var myMaps = Meteor.users.findOne({_id: userId}).maps;
  return Mindmaps.find({_id: { $in: myMaps }});
});
Meteor.methods({
  //Only Meteor can delete the documents - Not permitted for client
  deleteNode: function (id) {
    mindMapService.deleteNode(id);
  },

  countMaps: function () {
    return Mindmaps.find({position: null}).count();
  },
  addMapToUser: function(userId, mindMapId) {
    Meteor.users.update({_id: userId}, {$addToSet: {"maps": mindMapId}})
  }
});