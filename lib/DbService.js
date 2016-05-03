App.DbService = {};


App.DbService.addUser = function (emailId, mapId, permission) {

    var fetchedAclRecordByUserAndMindMap = fetchACLRecordByUserAndMindMap(mapId, emailId);
    var operation = getDatabaseOperation(fetchedAclRecordByUserAndMindMap, mapId, permission);

    if (operation == "NONE") {
        return;
    }
    if (operation == "INSERT") {
        insertNewMappingInACL(emailId, mapId, permission);
    }
    if (operation == "UPDATE") {
        updateMappingInACL(mapId, emailId, permission);
    }

};

function insertNewMappingInACL(emailId, mapId, permission) {
    acl.insert({user_id: emailId, mind_map_id: mapId, permissions: permission});
}

function updateMappingInACL(mapId, emailId, permission) {
    acl.update({mind_map_id: mapId, user_id: emailId}, {
        mind_map_id: mapId,
        user_id: emailId,
        permissions: permission
    });
}

function getDatabaseOperation(aclRecord, mapId, permission) {

    if (isMindMapPublic(mapId))
        return "NONE";

    if (noAclEntry())
        return "INSERT";

    if (entryExistsWIthLowerPermission())
        return "UPDATE";

    return "NONE";

    function entryExistsWIthLowerPermission() {
        return aclRecord.fetch()[0].permissions == 'r' && permission == 'w';
    }

    function noAclEntry() {
        return aclRecord.count() == 0;
    }
}

function isMindMapPublic(mapId) {
    return MindmapMetadata.find({"rootId": mapId, "owner": '*'}).count() == 1;
}

function fetchACLRecordByUserAndMindMap(mapId, emailId) {
    return acl.find({mind_map_id: mapId, user_id: emailId});
}