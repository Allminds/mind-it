Mindmaps = new Meteor.Collection("Mindmaps");
acl = new Meteor.Collection("acl");
//users1 = new Meteor.Collection("users");
acl.deny({
    update: function () { return true; },
    remove: function () { return true; },
    insert: function() { return true; }
});

Mindmaps.allow({
    insert: function (userId, document) {
        if(document.rootId==null)
            return true;
        var email = Meteor.user() ? Meteor.user().services.google.email : null;
        var doc = acl.findOne({ user_id: { $in: [email, "*"] }, mind_map_id: document.rootId , permissions: {$in : ["w","o"]} });
        if(doc) return true;
        return false;
    },
    update: function (userId, document) {
        var email = Meteor.user() ? Meteor.user().services.google.email : null;
        var mindMapId = document.rootId ? document.rootId : document._id;
        var doc = acl.findOne({ user_id: { $in: [email, "*"] }, mind_map_id: mindMapId , permissions: {$in : ["w","o"]} });
        if(doc) return true;
        return false;
    },
    remove: function (userId, document) {
        var email = Meteor.user() ? Meteor.user().services.google.email : null;
        var doc = acl.findOne({ user_id: { $in: [email, "*"] }, mind_map_id: document.rootId , permissions: {$in : ["w","o"]} });
        if(doc) return true;
        return false;
    }
});
