App.MindMapService = (function () {
    var instance;
    var isDownTimeActivated = false;

    var buildTree = function (node_id, depth, data) {
        var root = null;
        data.forEach(function (node) {
            App.nodeStore[node._id] = node;

            if (!App.Node.isRoot(node)) {
                node.childSubTree = node.childSubTree.map(function (id) {
                    return data.find(function (d) {
                        return d._id == id;
                    });
                });
            }
            else {
                node.left = node.left.map(function (id) {
                    return data.find(function (d) {
                        return d._id == id;
                    });
                });

                node.right = node.right.map(function (id) {
                    return data.find(function (d) {
                        return d._id == id;
                    });
                });

                root = node;
            }
        });

        return root;
    };

    var init = function () {
        return {
            createRootNode: function (name, user) {
                var root = new App.Node(name, null);
                //root.owner = user;
                var id = this.addNode(root);
                return id;
            },
            findTree: function (id) {
                return Mindmaps.find({$or: [{_id: id}, {rootId: id}]}).fetch();
            },
            buildTree: function (id, data) {
                return buildTree(id, 1, data);
            },
            addNode: function (node) {
                return Mindmaps.insert(node);
            },
            updateNode: function (id, $set) {
                var key = {_id: id};
                var value = getUpdatedNodeName(id, $set);

                Mindmaps.update(key, {$set: value});
            },
            addChild: function (parent, childNode) {
                var subTree = {};
                var subListName = 'childSubTree';
                if (App.Node.isRoot(parent)) {
                    subListName = childNode.position;
                }
                subTree[subListName] = ((childNode.index == null || childNode.index === undefined) ?
                    childNode._id : {$each: [childNode._id], $position: childNode.index});
                Mindmaps.update({_id: parent._id}, {$push: subTree});
            },
            deleteNode: function (id) {
                var nodeToBeDeleted = Mindmaps.findOne(id);
                Mindmaps.remove({$or: [{_id: id}, {parentId: id}]});
            },
            findNode: function (id) {
                var result = Mindmaps.find({_id: id}).fetch();
                return result.length > 0 ? result[0] : null;
            },
            isDownTime: function () {
                return isDownTimeActivated;
            }
        }
    };

    var hasOnlyWhitespace = function (name) {
        if (Boolean(name) && name.trim() === '') {
            return true;
        }
    };

    getUpdatedNodeName = function (id, $set) {

        var node = Mindmaps.findOne({_id: id});
        var isRoot = App.Node.isRoot(node);

        if (isRoot && $set.hasOwnProperty('name')) {
            var name = $set.name;
            if (!Boolean(name)) {
                $set.name = App.Constants.DefaultNodeName;
            }

            if (hasOnlyWhitespace(name)) {
                $set.name = App.Constants.DefaultNodeName;
            }
        }

        return $set;
    };


    var createInstance = function () {
        var object = new init();
        return object;
    };

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})
();