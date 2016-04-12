mindMapService = App.MindMapService.getInstance();
App.sharedMindmapUsers = [];

Meteor.publish('mindmap', function (id, user_email_id, isSharedMindmap) {
    var userInfo = {emailId: user_email_id, mindmapId: id};
    if (isSharedMindmap == App.Constants.Mode.WRITE) {
        addToSharedMindmapUsers(userInfo);

    }
    this._session.socket.on("close", Meteor.bindEnvironment(function () {
        removeFromSharedMindmapUsers(userInfo);
    }, function (e) {
    }));

    var readPermitted = acl.findOne({user_id: {$in: [user_email_id, "*"]}, mind_map_id: id});
    if (readPermitted || isSharedMindmap) {
        return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});

    }
    else {
        if (acl.find({mind_map_id: id}).count() == 0) {
            return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});
        } else {

            return Mindmaps.find({_id: null});
        }
    }


});
Meteor.publish('mindmapForSharedLink', function (id) {
    return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});
});


Meteor.publish('userdata', function () {
    return Meteor.users.find(this.userId);
});
Meteor.publish('myRootNodes', function (emailId) {
    return rootNodesOfMyMaps(emailId);
});

Meteor.publish('onlineusers', function (mindmap) {
    var results = acl.find({mind_map_id: mindmap}).fetch();
    user_ids = results.map(function (obj) {
        return obj.user_id;
    });
    for (var i = 0; i < App.sharedMindmapUsers.length; i++) {
        if (mindmap == App.sharedMindmapUsers[i].mindmapId) {
            user_ids.push(App.sharedMindmapUsers[i].emailId);
        }
    }
    return Meteor.users.find({'services.google.email': {$in: user_ids}});

});
Meteor.publish('acl', function (user_id) {
    return acl.find({user_id: user_id});
});

Meteor.publish('MindmapMetadata', function (link) {
    return MindmapMetadata.find({$or: [{readOnlyLink: link}, {readWriteLink: link}]});
})

Meteor.publish('Mindmaps', function (emailId) {
    //return Mindmaps.find();
    //var user = Meteor.user() ? Meteor.user().services.google.email : "*";
    var allAclMaps = acl.find({user_id: emailId}).fetch();
    var mapIds = allAclMaps.map(function (element) {
        return element.mind_map_id
    });
    return Mindmaps.find({_id: {$in: mapIds}});
});

var rootNodesOfMyMaps = function (emailId) {

    var permissions = acl.find({user_id: emailId}).fetch();
    var myMapIds = permissions.map(function (element) {
        return element.mind_map_id
    });
    return Mindmaps.find({_id: {$in: myMapIds}});

};

Meteor.methods({
    //Only Meteor can delete the documents - Not permitted for client
    deleteNode: function (id) {
        mindMapService.deleteNode(id);
    },

    countMaps: function () {
        return Mindmaps.find({parentId: null}).count();
    },

    addMapToUser: function (emailId, mindMapId, permisson) {
        App.DbService.addUser(emailId, mindMapId, permisson);
    },

    findTree: function (id, user_email_id, isSharedMindmap) {
        var readPermitted = acl.findOne({user_id: {$in: [user_email_id, "*"]}, mind_map_id: id});
        if (readPermitted || isSharedMindmap) {
            return mindMapService.findTree(id);

        }
        else {
            if (acl.find({mind_map_id: id}).count() == 0) {
                return mindMapService.findTree(id);
            } else {
                if (!readPermitted && user_email_id != '*') {
                    throw new Meteor.Error(
                        802, "Inaccessible Private Mindmap");
                }
                throw new Meteor.Error(
                    801, "Not A Public Mindmap");
            }
        }
        return;
    }
    ,
    iterateOverNodesList: function () {
        var AllNodes = Mindmaps.find({}).fetch();
        generateData(AllNodes);
    },
    isWritable: function (mindMapId, emailId) {
        var b = acl.find({
                mind_map_id: mindMapId,
                user_id: {$in: [emailId, "*"]},
                permissions: {$in: ["w", "o"]}
            }).count() > 0;
        if (acl.find({mind_map_id: mindMapId}).count() == 0)
            b = true;
        return b;
    },
    countNodes: function () {
        return Mindmaps.find({}).count();
    },
    isInvalidMindmap: function (id) {
        return Mindmaps.find({_id: id}).fetch().length == 0;
    },
    addMaptoMindmapMetadata: function (emailId, mindmapId) {
        addToMindmapMetaData(mindmapId, emailId);

    },
    getSharableReadLink: function (id) {
        var doc = MindmapMetadata.findOne({rootId: id});

        if (!doc) {
            var document = {
                rootId: id,
                owner: '*',
                readOnlyLink: generateSharableLink(),
                readWriteLink: generateSharableLink()
            };
            MindmapMetadata.insert(document);
            doc = MindmapMetadata.findOne({rootId: id});
        }
        if (doc.readOnlyLink.indexOf("www.mindit.xyz") != -1) {
            doc.readOnlyLink = doc.readOnlyLink.slice(15);
            MindmapMetadata.update({rootId: id}, {$set: {readOnlyLink: doc.readOnlyLink}});
        }
        return doc.readOnlyLink;
    },
    getSharableWriteLink: function (id) {
        var doc = MindmapMetadata.findOne({rootId: id});
        if (!doc) {
            var document = {
                rootId: id,
                owner: '*',
                readOnlyLink: generateSharableLink(),
                readWriteLink: generateSharableLink()
            };
            MindmapMetadata.insert(document);
            doc = MindmapMetadata.findOne({rootId: id});
        }
        if (doc.readWriteLink.indexOf("www.mindit.xyz") != -1) {
            doc.readWriteLink = doc.readWriteLink.slice(15);
            MindmapMetadata.update({rootId: id}, {$set: {readWriteLink: doc.readWriteLink}});
        }
        return doc.readWriteLink;
    },
    getRootNodeFromLink: function (link) {
        var doc = MindmapMetadata.findOne({$or: [{readOnlyLink: link}, {readWriteLink: link}]});
        return doc;
    },
    updateUserStatus: function (email_id, mindMapId, nodeId) {
        App.usersStatusService.updateUserStatus(email_id, mindMapId, nodeId);
    },
    createUserFromAdmin: function (username, profile, services) {
        var content = JSON.parse(username);
        var item = Meteor.users.findOne({
            '$or': [
                {'services.google.id': content.services.google.id},
                {'emails.address': content.services.google.email},
                {'services.google.email': content.services.google.email}
            ]
        });
        if (typeof item == 'undefined') {
            var user_id = Accounts.createUser({
                email: content.services.google.email,
                profile: content.services.profile,
                services: services
            })
            Meteor.users.update({
                _id: user_id
            }, {
                $set: {
                    services: {google: content.services.google}
                }
            });
            var user = Meteor.users.find({"_id": user_id}).fetch();
            ;
            return user;
        }
        else {
            var user = Meteor.users.findOne({
                '$or': [
                    {'services.google.id': content.services.google.id},
                    {'emails.address': content.services.google.email},
                    {'services.google.email': content.services.google.email}
                ]
            });
            return user;
        }
    },
    myRootNodes : function(emailId){
        var result = rootNodesOfMyMaps(emailId).fetch();
        console.log("In myRootNodes",result,emailId);
        return result;
    },
    createRootNode: function (emailId) {
        var mindMapId = mindMapService.createRootNode("New Node", emailId);
        if (emailId != "*") {
            App.DbService.addUser(emailId, mindMapId, "o");
        }
        addToMindmapMetaData(emailId, mindMapId);
        return mindMapId;
    },
    createNode: function (name, parentId, rootId, position) {
        var newNode = new App.Node(name);
        newNode.parentId = parentId;
        newNode.position = position;
        newNode.rootId = rootId;
        return mindMapService.addNode(newNode);
    },
    updateNode: function (id, data) {
        mindMapService.updateNode(id, data);
    },
    isPublicMindmap: function (id) {
        var results = acl.find({mind_map_id: id}).fetch();
        if (results.length != 0)
            return false;
        else
            return true;
    }

});
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};
function generateSharableLink() {
    var date = "" + new Date().getTime();
    var url = date.substring(0, date.length / 2);
    url += randomString(10, App.Constants.CharacterSet);
    url += date.substring(date.length / 2 + 1, date.length - 1);
    url += randomString(10, App.Constants.CharacterSet);
    return "sharedLink/" + url;
}
function addToMindmapMetaData(mindmapId, emailId) {
    var document = {
        rootId: mindmapId,
        owner: emailId,
        readOnlyLink: generateSharableLink(),
        readWriteLink: generateSharableLink()
    };
    MindmapMetadata.insert(document);
}

function addToSharedMindmapUsers(userInfo) {
    var i;
    for (i = 0; i < App.sharedMindmapUsers.length; i++) {
        if (userInfo.emailId == App.sharedMindmapUsers[i].emailId && userInfo.mindmapId == App.sharedMindmapUsers[i].mindmapId) {
            break;
        }
    }
    if (i == App.sharedMindmapUsers.length) {
        App.sharedMindmapUsers.push(userInfo);
    }
}
function removeFromSharedMindmapUsers(userInfo) {
    for (var i = 0; i < App.sharedMindmapUsers.length; i++) {
        if (userInfo.emailId == App.sharedMindmapUsers[i].emailId && userInfo.mindmapId == App.sharedMindmapUsers[i].mindmapId) {
            App.sharedMindmapUsers.splice(i, 1);
            break;
        }
    }
}

