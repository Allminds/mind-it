Template.dashboard.helpers({
    maps: function() {
        var myMaps = Meteor.user().maps;
        //put in mind map service
        return Mindmaps.find({_id: { $in: myMaps }});
    }
});

var enableHelpLink = function () {
    $('#help-modal').modal('show');
};

Template.dashboard.rendered = function rendered() {
    d3.select("#help-link").on('click', enableHelpLink);
};
