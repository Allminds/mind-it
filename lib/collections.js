Mindmaps = new Meteor.Collection("Mindmaps");
acl = new Meteor.Collection("acl");
MindmapMetadata = new Meteor.Collection("MindmapMetadata");

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
        var docCount = acl.find({ user_id: { $in: [email, "*"] }, mind_map_id: document.rootId , permissions: {$in : ["w","o"]} }).count();
        if(docCount>0) return true;
        if(acl.find({mind_map_id: document.rootId}).count() == 0){
            return true;
        }
        return false;
    },
    update: function (userId, document) {
        var email = Meteor.user() ? Meteor.user().services.google.email : null;
        var mindMapId = document.rootId ? document.rootId : document._id;
        var doc = acl.findOne({ user_id: { $in: [email, "*"] }, mind_map_id: mindMapId , permissions: {$in : ["w","o"]} });
        if(doc) return true;
        if(acl.find({mind_map_id: mindMapId}).count() == 0){
            return true;
        }
        return false;
    },
    remove: function (userId, document) {
        var email = Meteor.user() ? Meteor.user().services.google.email : null;
        var mindMapId = document.rootId ? document.rootId : document._id;
        var doc = acl.findOne({ user_id: { $in: [email, "*"] }, mind_map_id: mindMapId , permissions: {$in : ["w","o"]} });
        if(doc) return true;
        console.log("After Doc false");

        if(acl.find({mind_map_id:  mindMapId}).count() == 0){
            return true;
        }
        console.log("Before false");
        return false;
    }
});

MindmapMetadata.allow({
    insert: function (userId,document){
        return true;
    },

    update: function(userId,document){
        return true;
    },
    remove:function(userId,document){
        return true;
    }


});
