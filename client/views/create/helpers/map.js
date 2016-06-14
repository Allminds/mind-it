App.map = {};

App.map.getDataOfNodeWithClassNamesString = function (classNames) {
    var node = d3.select(classNames)[0][0];
    return node ? node.__data__ : null;
};

App.map.addNodeToUI = function (parent, newNode) {
    var subTree = parent ? (App.Node.isRoot(parent) ? parent[newNode.position] : parent.childSubTree) : null;

    if (subTree) {
        subTree.splice(newNode.index, 0, newNode);
    }

    App.chart.update();
};

App.map.addNewNode = function (parent, dir, childIndex) {
    var node = new App.Node("", dir, parent, childIndex);

    App.Node.addToDatabase(node);
    App.Node.addChild(parent, node);

    return node;
};

App.map.makeEditable = function (nodeId) {
    var node = d3.selectAll('#mindmap svg .node').filter(function (node) {
        return node._id === nodeId
    })[0][0];

    if (node) {
        App.showEditor(node);
    }
};

App.map.findOne = function (node, fun) {
    if (fun(node)) {
        return node;
    }

    var children = node.children || node._children || [],
        res = children.reduce(function (result, child) {
            return result || App.map.findOne(child, fun);
        }, null);

    return res;
};

App.map.getNodeDataWithNodeId = function (nodeId) {
    return Object.keys(App.nodeStore).indexOf(nodeId) != -1 ? App.nodeStore[nodeId] : null;
};

App.map.storeSourceNode = function (sourceNode) {
    App.map.sourceNode = App.cloneObject(sourceNode);
};
