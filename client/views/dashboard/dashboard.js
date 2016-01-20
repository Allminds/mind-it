Template.dashboard.helpers({
    maps: function() {
        return App.DbService.rootNodesOfMyMaps(Meteor.user().services.google.email);
    }
});

var enableHelpLink = function () {
    $('#help-modal').modal('show');
};

Template.dashboard.rendered = function rendered() {
    d3.select("#help-link").on('click', enableHelpLink);
};
