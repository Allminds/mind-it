App.cursorTracker = {
    changed: function (id, fields) {
        App.onlineUsers = fields.onlineUsers;
        App.showCursorLabels(App.onlineUsers);
    }
};
App.showCursorLabels = function (onlineUsers) {

    if (onlineUsers == null) {
        return;
    }
    d3.selectAll("circle.user-cursor").remove();
    for (var index = 0; index < onlineUsers.length; index++) {

        if (onlineUsers[index].email != Meteor.user().services.google.email) {
            var id = onlineUsers[index].currentWorkingNode;
            if (id == null) {
                continue;
            }
            var d3Node = App.presentation.getD3Node(id);
            if (d3Node == null) {
                console.log("Null d3 Id : ", id);
            } else {
                if (onlineUsers.length < App.colorMap.length) {
                    while (App.colorMap[App.colorCursorPosition].isAssigned == true) {
                        App.colorCursorPosition = App.colorCursorPosition % App.colorMap.length;
                    }
                    var color;
                    if (App.colorUserMap[onlineUsers[index].email]) {
                        color = App.colorUserMap[onlineUsers[index].email];
                    } else {
                        color = App.colorMap[App.colorCursorPosition].code;
                        App.colorMap[App.colorCursorPosition].isAssigned = true;
                        App.colorUserMap[onlineUsers[index].email] = App.colorMap[App.colorCursorPosition].code;
                        App.colorCursorPosition++;
                    }
                    var cy = 7;
                    if (d3Node.__data__.rootId == null) {
                        cy = 15;
                    }
                    d3.select(d3Node).append("circle")
                        .attr("class", "user-cursor")
                        .attr("cx", 0)
                        .attr("cy", cy)
                        .attr("r", 5).attr("fill", color);
                }
            }
        }
    }
};