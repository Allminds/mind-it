Template.ActionBar.helpers({
    userimages: function () {

        if(Meteor.settings.public.onlineUsers == true) {
            return extractUserImage();
        } else{
            return [];
        }
    }
});

var extractUserImage = function () {
    var usersAvailable = MindmapMetadata.findOne();
        var Srcs = usersAvailable.onlineUsers.map(function (x) {
            var user_object;
            //console.log("d3 stuff",d3.select(".node.level-0")[0][0]);
            //if (x.status.online && App.currentMap == x.mindmap.id) {
                //console.log("status",x.status.online);
//        user_object.name=x.services.google.name;
//        user_object.picture=x.services.google.picture;
                return {name: x.profile.name, picture: x.picture};
            //}
        });
    var imageSrcs = Srcs.filter(function (y) {
        if (y === undefined || y === null) {
            // do something
        }
        else
            return y;
    });
    return imageSrcs;
}