App.DbService = {};

App.DbService.rootNodesOfMyMaps = function(emailId) {
    var permissions = acl.find({user_id: emailId, permissions: "o"}).fetch();
    var myMapIds = permissions.map(function(element) { return element.mind_map_id });
    return Mindmaps.find({_id: { $in: myMapIds }});
};

App.DbService.addUser = function(emailId, mapId, permission) {
    return acl.insert({user_id: emailId, mind_map_id: mapId, permissions: permission});
};

App.DbService.myPermissions = function (emailId) {
    return acl.find({user_id: emailId});
};

