Template.dashboard.helpers({
    maps: function() {
        return Mindmaps.find().fetch();
    }
});

var enableHelpLink = function () {
    $('#help-modal').modal('show');
};

Template.dashboard.rendered = function rendered() {
    d3.select("#help-link").on('click', enableHelpLink);
};
