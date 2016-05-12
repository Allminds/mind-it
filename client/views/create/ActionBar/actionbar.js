Template.ActionBar.helpers({
    userimages: function () {
        return extractUserImage();
    },
    hideInEmbedMode: function () {
        if (App.isEmbedUrl()) {
            return false;
        } else {
            return true;
        }
    },

});

Template.ActionBar.events({
    'click #fullscreen-btn': function (e, args) {
        App.toggleFullscreen();
    }
});


App.isEmbedUrl = function () {
    var location = window.location.href;
    if (location.indexOf("/embed/") != -1) {
        return true;
    } else {
        return false;
    }
}

extractUserImage = function () {
    if (!Meteor.user()) {
        return [];
    }
    var usersAvailable = MindmapMetadata.findOne();
    usersAvailable = usersAvailable.onlineUsers.filter(function (user) {
        return user.email != Meteor.user().services.google.email;
    });

    var Srcs = usersAvailable.map(function (x) {
        return {name: x.profile.name, picture: x.picture, color: App.colorUserMap[x.email]};
    });
    var imageSrcsAndColors = Srcs.filter(function (y) {
        return (y.name != undefined && y.name != null);
    });
    return imageSrcsAndColors;
};
App.toggleFullscreen = function () {
    if (!screenfull.isFullscreen) {
        screenfull.request();
        $("#fullscreen-btn").hide();
    }
};
var show_fullscreen_btn = function () {
    if (!screenfull.isFullscreen) {
        $("#fullscreen-btn").show();
    }
}
document.addEventListener(screenfull.raw.fullscreenchange, show_fullscreen_btn);