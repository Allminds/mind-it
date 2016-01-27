App.DbService = {};

App.DbService.addUser = function(emailId, mapId, permission) {
    return acl.insert({user_id: emailId, mind_map_id: mapId, permissions: permission});
};

