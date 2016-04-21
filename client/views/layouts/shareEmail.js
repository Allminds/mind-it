Template.shareEmail.helpers({
    permissions: function () {
        if (App.editable) {
            return [{name: 'r', value: 'Read Only'}, {name: 'w', value: 'Read-Write'}];
        }
        else {
            return [{name: 'r', value: 'Read Only'}];
        }
    },
});
Template.shareEmail.events({
    'click #submitButton': function (e, args) {
        var permission = d3.select("#permission")[0][0].value;
        var eMail = d3.select("#e_mail2")[0][0].value;
        //var mindMapId = Mindmaps.findOne({"position": null })._id;
        var mindMapId = d3.select(".node.level-0")[0][0].__data__._id;
        Meteor.call("addMapToUser", eMail, mindMapId, permission);
    }
});
