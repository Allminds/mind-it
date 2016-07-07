App.NodeFormatter = {};

App.NodeFormatter.format = function (selectedNode, inputNode) {
    var updatedNodeName = {};
    var children;

    updatedNodeName.name = inputNode.name;
    App.Node.updateNode(selectedNode._id, updatedNodeName);
    children = App.Node.getChildren(inputNode);
    parseAllNodes(selectedNode, children);
};

var parseAllNodes = function (parent, children) {
    children.forEach(function (child) {
        var childFromDb = addParentAndChildNodeToDb(parent, child);
        var grandChildren = App.Node.getChildren(child);

        parseAllNodes(childFromDb, grandChildren);
    });

    return parent;
};

var directionOfParent = function (parent) {
    if (App.Node.isRoot(parent)) {
        return App.Constants.Direction.RIGHT;
    }

    return parent.position;
};

var addParentAndChildNodeToDb = function (parentNode, childNode) {
    var childNodeFromDb;
    var newChildNode;
    var direction = directionOfParent(parentNode);

    newChildNode = new App.Node(childNode.name, direction, parentNode);
    childNodeFromDb = App.Node.addToDatabase(newChildNode);
    App.Node.addChild(parentNode, childNodeFromDb);

    return childNodeFromDb;
};
