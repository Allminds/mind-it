App.usersStatusService = {};

App.usersStatusService.updateUserStatus = function(emailId, mindMapId) {
   if(Meteor.users.find({"services.google.email": emailId}).count()>=0)
    {

       return Meteor.users.update({"services.google.email": emailId},{$set : {"mindmap_id":mindMapId}});

    }


};

