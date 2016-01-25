Mindmaps = new Meteor.Collection("Mindmaps");
acl = new Meteor.Collection("acl");

acl.deny({
    update: function () { return true; },
    remove: function () { return true; },
    insert: function() { return true; }
});