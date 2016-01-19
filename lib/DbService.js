App.DbService = {};

App.DbService.rootNodesOfMyMaps = function(userId) {
    var permissions = acl.find({user_id: userId, permissions: "o"}).fetch();
    var myMapIds = permissions.map(function(element) { return element.mind_map_id });
    return Mindmaps.find({_id: { $in: myMapIds }});
};

App.DbService.addOwner = function(userId, mapId) {
    return acl.insert({user_id: userId, mind_map_id: mapId, permissions: "o"});
};

App.DbService.myPermissions = function (userId) {
    return acl.find({user_id: userId});
};

