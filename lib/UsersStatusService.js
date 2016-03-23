App.usersStatusService = {};

App.usersStatusService.updateUserStatus = function(emailId, mindMapId,nodeId) {
   if(Meteor.users.find({"services.google.email": emailId}).count()>=0)
    {

//       return Meteor.users.update({"services.google.email": emailId},{$set : {"mindmap_id":mindMapId}});
      return Meteor.users.update({"services.google.email":emailId},{$set :  {mindmap:{id: mindMapId,node :nodeId}}});

    }



};

