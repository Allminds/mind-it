mindMapService = App.MindMapService.getInstance();

Meteor.publish('mindmap', function (id, user_email_id,isSharedMindmap) {
  var readPermitted = acl.findOne({user_id: { $in: [user_email_id, "*"] }, mind_map_id: id});
  if(readPermitted || isSharedMindmap ){
    return Mindmaps.find({$or:[{_id:id},{rootId:id}]});

  }
  else{
    if(acl.find({mind_map_id: id}).count() == 0 ) {
      return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});
    } else {

      return Mindmaps.find({_id: null});
    }
  }

});
Meteor.publish('mindmapForSharedLink',function(id){
  return Mindmaps.find({$or:[{_id:id},{rootId:id}]});
});


Meteor.publish('userdata', function () {
  return Meteor.users.find(this.userId);
});
Meteor.publish('myRootNodes', function(emailId) {
  return rootNodesOfMyMaps(emailId);
});
Meteor.publish('acl',function(user_id){
  return acl.find({user_id:user_id});
});

Meteor.publish('MindmapMetadata', function(link){
  return MindmapMetadata.find({$or:[{readOnlyLink:link},{readWriteLink:link}]});
})

Meteor.publish('Mindmaps', function(emailId){
    //return Mindmaps.find();
  //var user = Meteor.user() ? Meteor.user().services.google.email : "*";
  var allAclMaps = acl.find({user_id: emailId}).fetch();
  var mapIds = allAclMaps.map(function(element){ return element.mind_map_id});
  return Mindmaps.find({_id: {$in: mapIds}});
});

var rootNodesOfMyMaps = function(emailId) {

  var permissions = acl.find({ user_id: emailId }).fetch();
  var myMapIds = permissions.map(function(element) { return element.mind_map_id });
  return Mindmaps.find({_id: { $in: myMapIds }});
};

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
  },

  findTree: function (id, user_email_id,isSharedMindmap) {
    console.log("In FindTree");
    var readPermitted = acl.findOne({user_id: { $in: [user_email_id, "*"] }, mind_map_id: id});
    if(readPermitted || isSharedMindmap ){
      return mindMapService.findTree(id);

    }
    else{
      if(acl.find({mind_map_id: id}).count() == 0 ) {
        return mindMapService.findTree(id);
      } else {

        return mindMapService.findTree(null);
      }
    }
    return ;
  }
  ,
  iterateOverNodesList: function(){
          var AllNodes= Mindmaps.find({}).fetch();
          generateData(AllNodes);
    },
  isWritable: function (mindMapId, emailId) {
      var b = acl.find({mind_map_id: mindMapId, user_id: {$in: [emailId, "*"]}, permissions: {$in: ["w","o"]}}).count() > 0;
    if(acl.find({mind_map_id: mindMapId}).count()==0)
        b=true;
      return b;
  },
  countNodes: function() {
     return Mindmaps.find({}).count();
  },
  isInvalidMindmap: function(id){
    return Mindmaps.find({_id:id}).fetch().length == 0;
  },
  addMaptoMindmapMetadata: function(emailId,mindmapId){
    var document = {rootId:mindmapId, owner:emailId,readOnlyLink:generateSharableLink(),readWriteLink:generateSharableLink()};
    MindmapMetadata.insert(document);

  },
  getSharableReadLink: function(id){
    var doc = MindmapMetadata.findOne({rootId:id});
    return doc.readOnlyLink;
  },
  getSharableWriteLink: function (id) {
    var doc = MindmapMetadata.findOne({rootId:id});
    return doc.readWriteLink;
  },
  getRootNodeFromLink: function(link){
    var doc = MindmapMetadata.findOne({$or:[{readOnlyLink:link},{readWriteLink:link}]});
    return doc.rootId;
  }
});
function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};
var generateSharableLink = function (){
  var date = ""+new Date().getTime();
  var  url=date.substring(0,date.length/2);
  url += randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  url += date.substring(date.length/2+1,date.length-1);
  url += randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  return "www.mindit.xyz/sharedLink/"+url;
}

