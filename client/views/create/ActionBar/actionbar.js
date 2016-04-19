Template.ActionBar.helpers({
    userimages: function () {

        if(Meteor.settings.public.onlineUsers == true) {
            return extractUserImage();
        } else{
            return [];
        }
    },
    hideInEmbedMode:function () {
        var location = window.location.href;
        if(location.indexOf("/embed/") == -1){
            return true;
        }else {
            return false;
        }
    }
});

extractUserImage = function () {
    var usersAvailable = Meteor.users.find().fetch();
    var Srcs = usersAvailable.map(function (x) {
        var user_object;
        //console.log("d3 stuff",d3.select(".node.level-0")[0][0]);
        if (x.status.online && App.currentMap == x.mindmap.id) {
            //console.log("status",x.status.online);
//        user_object.name=x.services.google.name;
//        user_object.picture=x.services.google.picture;
            return {name: x.services.google.name, picture: x.services.google.picture};
        }
    });
    console.log("before filter: ", Srcs);
    var imageSrcs = Srcs.filter(function (y) {
        if (y === undefined || y === null) {
            // do something
        }
        else
            return y;
    });
    return imageSrcs;
}