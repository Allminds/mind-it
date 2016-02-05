Template.dashboard.helpers({
    allMaps: function(){
        var user = Meteor.user() ? Meteor.user().services.google.email : "*";
        var allAclMaps = acl.find({user_id: user}).fetch();
        var mapIds = allAclMaps.map(function(element){ return element.mind_map_id});
        return Mindmaps.find({_id: {$in: mapIds}}).fetch();
    },
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
    $("#tabbedPanel").tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
    $( "#tabbedPanel li" ).removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );

    Meteor.subscribe('Mindmaps',function(){
        if(!($("#ownedMapsTable").hasClass("dataTable"))){
            var dt = $("#ownedMapsTable").dataTable({
                "aaSorting":[],
                "bPaginate": false,
                "info":false,
                "aoColumns": [
                    { "sTitle": "Name", "mData": function (data) { return "<a href='/create/"+data[0]+"'>"+data[1]+"</a>" }},
                    { "sTitle": "Owner", "mData": function (data) { return data[2] }}
                ],
                "lengthMenu": -1
            });
            var p = [];

            Template.dashboard.__helpers[" ownedMaps"]().forEach(function(e){
                if(e.name && e.owner)
                    p.push([e._id, e.name, e.owner]);
            });

            if(p.length > 0)
                dt.fnAddData(p);
        }

        if(!($("#sharedMapsTable").hasClass("dataTable"))){
            var dt = $("#sharedMapsTable").dataTable({
                "aaSorting":[],
                "bPaginate": false,
                "info":false,
                "aoColumns": [
                    { "sTitle": "Name", "mData": function (data) { return "<a href='/create/"+data[0]+"'>"+data[1]+"</a>" }},
                    { "sTitle": "Owner", "mData": function (data) { return data[2] }}
                ],
                "lengthMenu": -1

            });
            var p = [];
            Template.dashboard.__helpers[" sharedMaps"]().forEach(function(e){
                if(e.name && e.owner)
                    p.push([e._id, e.name, e.owner]);
            });

            if(p.length > 0)
                dt.fnAddData(p);
        }

        if(!($("#allMapsTable").hasClass("dataTable"))){
            var dt = $("#allMapsTable").dataTable({
                "aaSorting":[],
                "bPaginate": false,
                "info":false,
                "aoColumns": [
                    { "sTitle": "Name", "mData": function (data) { return "<a href='/create/"+data[0]+"'>"+data[1]+"</a>" }},
                    { "sTitle": "Owner", "mData": function (data) { return data[2] }},
                    { "sTitle": "Created On", "mData": function (data) { return "02/02/2016" }},
                    { "sTitle": "Last Modified By", "mData": function (data) { return "Anubha S" }}
                ],
                "lengthMenu": -1
            });
            var p = [];
            Template.dashboard.__helpers[" allMaps"]().forEach(function(e){
                if(e.name && e.owner)
                    p.push([e._id,e.name, e.owner]);
            });

            if(p.length > 0)
                dt.fnAddData(p);
        }
    });
};
