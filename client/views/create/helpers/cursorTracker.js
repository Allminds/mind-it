App.cursorTracker = {
    changed: function (id , fields) {
        if(Meteor.settings.public.cursorMovement == true) {
            console.log("In Cursor tracker Fields : " , fields.onlineUsers );

            var onlineUsers = fields.onlineUsers;


            var node = d3.select(".cursorSelected-0");
            //console.log("Node 1 : " , node);
            node.classed("cursorSelected-0", false);

            node = d3.select(".cursorSelected-1");
            //console.log("Node 2 : " , node);
            node.classed("cursorSelected-1", false);

            node = d3.select(".cursorSelected-2");
            //console.log("Node 3 : " , node);
            node.classed("cursorSelected-2", false);

            for(var index = 0; index < onlineUsers.length ; index++) {
                if(onlineUsers[index].email != Meteor.user().services.google.email) {
                    var id = onlineUsers[index].currentWorkingNode;

                    if(id == null) {
                        continue;
                    }

                    var d3Node = App.presentation.getD3Node(id);
                    if(d3Node == null) {
                        console.log("Null d3 Id : " , id);
                    }
                    if(d3Node != d3.select(".selected")[0][0]) {
                        var cssClassName = "cursorSelected-" + index;
                        console.log("CSSCLASS : " , cssClassName , " Name: " , d3Node.__data__.name , " user Name : " , onlineUsers[index].email);
                        d3.select(d3Node).classed(cssClassName , true);
                    }
                }
            }
        }
    }
};