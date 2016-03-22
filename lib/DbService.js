App.DbService = {};

App.DbService.addUser = function(emailId, mapId, permission) {
   if(acl.find({mind_map_id: mapId,user_id: emailId}).count()==0)
   return acl.insert({user_id: emailId, mind_map_id: mapId, permissions: permission});
  else{
       return acl.update({mind_map_id: mapId, user_id: emailId},{mind_map_id: mapId,user_id: emailId,permissions: permission});
  }
    console.log("Updated/inserted");

};

