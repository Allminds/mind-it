OnlineUsersIndicator = {};

OnlineUsersIndicator.getOnlineUsersInformation = function (onlineUsers) {
    var onlineUsersInformation = [];

    for (var i = 0; i < onlineUsers.length; i++) {
        if (onlineUsers[i].email !== Meteor.user().services.google.email) {
            var userInformation = {};
            userInformation.currentWorkingNode = onlineUsers[i].currentWorkingNode;
            userInformation.colorCode = Color.getColorCode(i);
            onlineUsersInformation.push(userInformation);
        }
    }

    return onlineUsersInformation;
};