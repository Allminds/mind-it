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

    var readPermitted = acl.findOne({user_id: user_email_id, mind_map_id: id});
    if (readPermitted || isSharedMindmap) {
        return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});

    }
    else {
        if (acl.find({mind_map_id: id}).count() == 0 || MindmapMetadata.find({rootId: id, owner: '*'})) {
            return Mindmaps.find({$or: [{_id: id}, {rootId: id}]});
        } else {

            return Mindmaps.find({_id: null});
        }
    }

});

Meteor.publish('userdata', function () {
    return Meteor.users.find(this.userId);
});
Meteor.publish('myRootNodes', function (emailId) {
    return rootNodesOfMyMaps(emailId);
});

Meteor.publish('onlineusers', function (mindmap) {
    if (!this.userId) {
        return [];
    }

    var doc = MindmapMetadata.findOne({rootId: mindmap});
    var onlineUsers = [];
    if (doc && doc.hasOwnProperty("onlineUsers")) {
        onlineUsers = doc.onlineUsers;
    }

    var currentUser = Meteor.users.findOne(this.userId);
    var userInfo = {};
    userInfo.email = currentUser.services.google.email;
    userInfo.profile = currentUser.profile;
    userInfo.picture = currentUser.services.google.picture;

    this._session.socket.on("close", Meteor.bindEnvironment(function () {
        onlineUsers = MindmapMetadata.findOne({rootId: mindmap}).onlineUsers;

        onlineUsers = onlineUsers.filter(function (user) {
            return user.email != currentUser.services.google.email;
        });

        MindmapMetadata.update({rootId: mindmap}, {$set: {onlineUsers: onlineUsers}});

    }, function (e) {
        console.log("Error : ", e);
    }));

    var i = 0;
    for (i = 0; i < onlineUsers.length; i++) {
        if (currentUser.services.google.email == onlineUsers[i].email) {
            break;
        }
    }

    if (i == onlineUsers.length) {
        onlineUsers.push(userInfo);
    }


    MindmapMetadata.update({rootId: mindmap}, {$set: {onlineUsers: onlineUsers}});

    return MindmapMetadata.find({rootId: mindmap}, {fields: {onlineUsers: 1, rootId: 1}});

});
Meteor.publish('acl', function (user_id) {
    return acl.find({user_id: user_id});
});

Meteor.publish('Mindmaps', function (emailId) {
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
        if (readPermitted || isSharedMindmap == "read" || isSharedMindmap == "write") {
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

        if (MindmapMetadata.find({rootId: mindMapId, owner: '*'}).count() == 1)
            return true;

        return acl.find({
                mind_map_id: mindMapId,
                user_id: {$in: [emailId, "*"]},
                permissions: {$in: ["w", "o"]}
            }).count() > 0;
    },
    countNodes: function () {
        return Mindmaps.find({}).count();
    },
    isInvalidMindmap: function (id) {
        return Mindmaps.find({$and: [{_id: id}, {rootId: null}]}).fetch().length == 0;
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
        if (!doc) {
            throw new Meteor.Error(
                803, "Invalid Link");
        }

        if (doc && doc.readOnlyLink == link) {
            doc.readWriteLink = "";
        }
        if (doc && doc.readWriteLink == link) {
            doc.readOnlyLink = "";
        }
        return doc;
    },
    updateUserStatus: function (mindMapId, nodeId) {
        if (!Meteor.userId()) {
            return;
        }
        var emailId = Meteor.users.findOne({_id: this.userId}).services.google.email;
        App.usersStatusService.updateUserStatus(emailId, mindMapId, nodeId);
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
    myRootNodes: function (emailId) {
        var result = rootNodesOfMyMaps(emailId).fetch();
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
        return MindmapMetadata.find({rootId: id, owner: '*'}).count() == 1;
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

