Template.ShareImageButton.events({
    'click #shareImageButton': function () {
        console.log("BUTTON CLICKED");
        $('#share-modal').modal('show');

    },
    'click #getSharableWriteLink': function () {

        Meteor.call("getSharableWriteLink", App.currentMap, function (error, value) {
            var msg = value;
            alert(msg);
        });
    },
    'click #getSharableReadLink': function () {
        Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
            var msg = value;
            alert(msg);
        });
    }
});
Template.ShareImageButton.helpers({
    shareReadLink: function () {
        if (App.isSharedMindmap == App.Constants.Mode.READ) {
            return "";
        }
        else
            return "Share read only link";
    },
    shareWriteLink: function () {
        if (App.isSharedMindmap == App.Constants.Mode.WRITE) {
            return "";
        }
        else
            return "Share read-write link";
    }

});

Template.Share.events({
    'click #shareImageButton': function () {
        console.log("BUTTON CLICKED");
        $('#share-modal').modal('show');

    },
    'click #getSharableWriteLink': function () {

        Meteor.call("getSharableWriteLink", App.currentMap, function (error, value) {
            var msg = value;
            alert(msg);
        });
    },
    'click #getSharableReadLink': function () {
        Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
            var msg = value;
            alert(msg);
        });
    }
});
Template.Share.helpers({
    shareReadLink: function () {
        if (App.isSharedMindmap == App.Constants.Mode.READ) {
            return "";
        }
        else
            return "Share read only link";
    },
    shareWriteLink: function () {
        if (App.isSharedMindmap == App.Constants.Mode.WRITE) {
            return "";
        }
        else
            return "Share read-write link";
    }

});