App.DbService = {};


App.DbService.addUser = function (emailId, mapId, permission) {

    if (isUserEmailValidForAclEntry(emailId) == false) {
        return;
    }

    var fetchedAclRecordByUserAndMindMap = fetchACLRecordByUserAndMindMap(mapId, emailId);
    var operation = getDatabaseOperation(fetchedAclRecordByUserAndMindMap, permission);

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

function getDatabaseOperation(aclRecord, permission) {


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

function fetchACLRecordByUserAndMindMap(mapId, emailId) {
    return acl.find({mind_map_id: mapId, user_id: emailId});
}

var isUserEmailValidForAclEntry = function (email) {
    return email != '*';
}