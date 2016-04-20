App.usersStatusService = {};

App.usersStatusService.updateUserStatus = function (emailId, mindMapId, nodeId) {
    
    var mindmapMetadata = MindmapMetadata.findOne({rootId: mindMapId});
    if (mindmapMetadata && mindmapMetadata.hasOwnProperty("onlineUsers")) {
        var onlineUsers = mindmapMetadata.onlineUsers;

        for (var index = 0; index < onlineUsers.length; index++) {
            if (onlineUsers[index].email == emailId) {
                onlineUsers[index].currentWorkingNode = nodeId;
            }
        }

        MindmapMetadata.update({rootId: mindMapId}, {$set: {onlineUsers: onlineUsers}});
    }

};

