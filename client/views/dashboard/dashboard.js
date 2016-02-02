Template.dashboard.helpers({

    ownedMaps: function() {
        var user = Meteor.user() ? Meteor.user().services.google.email : "*";
        var aclRecords = acl.find({user_id: user, permissions: "o" }).fetch();
        var mapIds = aclRecords.map(function(element){ return element.mind_map_id });
        return Mindmaps.find({_id: {$in: mapIds}}).fetch();
    },

    sharedMaps: function(){
        var user = Meteor.user() ? Meteor.user().services.google.email : "*";
        var aclRecords = acl.find({user_id: user, permissions: {$in: ['r','w']} }).fetch();
        var mapIds = aclRecords.map(function(element){ return element.mind_map_id });
        return Mindmaps.find({_id: {$in: mapIds}}).fetch();
    }
});

var enableHelpLink = function () {
    $('#help-modal').modal('show');
};

Template.dashboard.rendered = function rendered() {
    d3.select("#help-link").on('click', enableHelpLink);
};
