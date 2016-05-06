Mindmaps = new Meteor.Collection("Mindmaps");
acl = new Meteor.Collection("acl");
MindmapMetadata = new Meteor.Collection("MindmapMetadata");

acl.deny({
    update: function () {
        return true;
    },
    remove: function () {
        return true;
    },
    insert: function () {
        return true;
    }
});

Meteor.users.allow({
    update: function () {
        return true;
    },
    remove: function () {
        return true;
    },
    insert: function () {
        return true;
    }

});
Mindmaps.allow({
    insert: function (userId, document) {
        if (document.rootId == null)
            return true;
        var mindMapId = document.rootId ? document.rootId : document._id;
        var email = Meteor.user() ? Meteor.user().services.google.email : "*";

        var docCount = acl.find({
            user_id: {$in: [email, "*"]},
            mind_map_id: document.rootId,
            permissions: {$in: ["w", "o"]}
        }).count();
        if (docCount > 0) return true;
        if (MindmapMetadata.find({rootId: mindMapId, owner: '*'}).count() == 1 || isSharedMap(email, mindMapId)) {
            return true;    
        }

        return false;
    },
    update: function (userId, document) {

        var email = Meteor.user() ? Meteor.user().services.google.email : null;
        var mindMapId = document.rootId ? document.rootId : document._id;
        var doc = acl.findOne({user_id: {$in: [email, "*"]}, mind_map_id: mindMapId, permissions: {$in: ["w", "o"]}});
        if (doc) return true;
        if (MindmapMetadata.find({rootId: mindMapId, owner: '*'}).count() == 1 || isSharedMap(email, mindMapId)) {
            return true;
        }

        return false;
    },
    remove: function (userId, document) {
        var email = Meteor.user() ? Meteor.user().services.google.email : null;
        var mindMapId = document.rootId ? document.rootId : document._id;
        var doc = acl.findOne({user_id: {$in: [email, "*"]}, mind_map_id: mindMapId, permissions: {$in: ["w", "o"]}});
        if (doc) return true;

        if (MindmapMetadata.find({rootId: mindMapId, owner: '*'}).count() == 1 || isSharedMap(email, mindMapId)) {
            return true;
        }
        return false;
    }
});
var isSharedMap = function (emailId, mindmapId) {
    listOfUsers = App.sharedMindmapUsers.map(
        function (user) {
            return user.emailId;
        });
    listOfMindmaps = App.sharedMindmapUsers.map(
        function (info) {
            return info.mindmapId;
        }
    )
    if (listOfUsers.indexOf(emailId) != -1 && listOfMindmaps.indexOf(mindmapId) != -1) {
        return true;
    }
    return false;
}
MindmapMetadata.allow({
    insert: function (userId, document) {
        return true;
    },

    update: function (userId, document) {
        return true;
    },
    remove: function (userId, document) {
        return true;
    }
});
