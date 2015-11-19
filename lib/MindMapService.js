/* global Mindmaps */
/* global Session */
/* global SessionCounter */
/* global MindMapService */

MindMapService = function MindMapService() {
};

MindMapService.prototype.createRootNode = function (name, position, parent_id) {
    mindid = Mindmaps.insert({
        name: name,
        children: [],
        position: null,
        parent_id: parent_id
    });
    return mindid;
};
var buildTree = function (node_id, depth, data) {
    var node = data.find(function (d) {
        return d._id == node_id
    });
    if (!node) return
    var children = data.filter(function (d) {
        return d.parent_ids &&
            d.parent_ids.find(function (parent_id) {
                return node_id == parent_id;
            })
            && d.parent_ids.length == depth
    });
    (children || []).reduce(function (acc, curEle, curIndex, children) {

        var ele = children.find(function (x) {
            return curIndex == 0 ? x.previous == null : acc[curIndex - 1].next == x._id;
        });
        if (ele)
            acc.push(ele);
        return acc;
    }, []).forEach(function (d) {
        var childNode = buildTree(d._id, depth + 1, data);
        if (childNode) {
            node.children = node.children || [];
            node.children.push(childNode);
        }
    });
    return node;
};

MindMapService.prototype.findTree = function (id) {
    return Mindmaps.find({$or: [{_id: id}, {parent_ids: id}]}).fetch();
};
MindMapService.prototype.buildTree = function (id, data) {
    var tree = buildTree(id, 1, data);
    tree.left = tree.children.filter(function (node) {
        return node.position === 'left';
    });
    tree.right = tree.children.filter(function (node) {
        return node.position === 'right';
    });
    return tree;
};
MindMapService.prototype.addNode = function (node) {
    return Mindmaps.insert(node);
};

MindMapService.prototype.updateNode = function (id, $set) {
    var key = {_id: id};
    Mindmaps.update(key, {$set: $set});
};

MindMapService.prototype.addChild = function (current_node, dir) {
    var temp_node = {name: "d", children: []/*,left: [],right: []*/, direction: dir};
    Mindmaps.update({_id: current_node._id}, {$push: {children: temp_node/*, left: temp_node*/}});
};

MindMapService.prototype.deleteNode = function (id) {
    var nodeToBeDeleted = Mindmaps.findOne(id);
    if (nodeToBeDeleted.previous) {
        this.updateNode(nodeToBeDeleted.previous, {next: nodeToBeDeleted.next});
    }
    if (nodeToBeDeleted.next) {
        this.updateNode(nodeToBeDeleted.next, {previous: nodeToBeDeleted.previous});
    }
    Mindmaps.remove({$or: [{_id: id}, {parent_ids: id}]});
};
