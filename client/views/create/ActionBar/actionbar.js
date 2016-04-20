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
        if(isEmbedUrl()){
            return false;
        }else {
            return true;
        }
    },
    isEmbedUrl:function () {
        var location = window.location.href;
        if(location.indexOf("/embed/") != -1){
            return true;
        }else {
            return false;
        }
    }
});

extractUserImage = function () {
    if(!Meteor.user()) {
        return [];
    }

    var usersAvailable = MindmapMetadata.findOne();

    usersAvailable = usersAvailable.onlineUsers.filter(function(user) {
        return user.email != Meteor.user().services.google.email;
    });

    var Srcs = usersAvailable.map(function (x) {
        return {name: x.profile.name, picture: x.picture};
    });
    var imageSrcs = Srcs.filter(function (y) {
        return (y != undefined && y != null) ;
    });
    return imageSrcs;
};
App.viewFulScreen = function () {
    var url = window.location.href;
    url = url.replace("embed","sharedLink");
    var win = window.open(url, '_blank');
    win.focus();
}