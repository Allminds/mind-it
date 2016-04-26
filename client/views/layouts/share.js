Template.ShareImageButton.events({
    'click #shareImageButton': function () {
        $('#share-modal').modal('show');
    },
    'click #textBelowShareImageButton': function () {
        $('#share-modal').modal('show');
    },
    'click #getSharableWriteLink': function () {
        Meteor.call("getSharableWriteLink", App.currentMap, function (error, value) {
            var msg = value;
        });
    },
    'click #getSharableReadLink': function () {
        Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
            var msg = value;
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