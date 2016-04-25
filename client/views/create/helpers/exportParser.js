App.exportParser = {};

App.exportParser.positions = {
    LEFT: "left",
    RIGHT: "right"
};

App.exportParser.export = function (rootNodeName) {
    var XMLString = App.JSONConverter();
    var blob = new Blob([XMLString], {type: "text/plain;charset=utf-8"});
    App.saveAs(blob, rootNodeName + ".mm");
};

var XMLString = [];
App.JSONConverter = function () {
    XMLString = "<map version=\"1.0.1\">\n";
    var rootNode = App.presentation.getRootNode();
    XMLString += App.exportParser.nodeString(rootNode._id, rootNode.name);

    var leftChildren = rootNode.left;
    var rightChildren = rootNode.right;

    leftChildren.forEach(function (leftChildId) {
        var leftNode = Mindmaps.findOne({_id: leftChildId});

        if (leftNode == null) {
            console.log("NULL LeftNode : ", leftChildId);
        }

        var leftChildName = leftNode.name;
        XMLString += App.exportParser.nodeString(leftChildId, leftChildName, App.exportParser.positions.LEFT);

        var leftNodeChildren = leftNode.childSubTree;

        if (leftNodeChildren.length > 0) {
            App.exportParser.children_recurse(leftChildId);
        }

        XMLString += "</node>\n";
    });

    rightChildren.forEach(function (rightChildId) {
        var rightNode = Mindmaps.findOne({_id: rightChildId});

        if (rightNode == null) {
            console.log("NULL RightNode : ", rightChildId);
        }

        var rightChildName = rightNode.name;
        XMLString += App.exportParser.nodeString(rightChildId, rightChildName, App.exportParser.positions.RIGHT);

        var rightNodeChildren = rightNode.childSubTree;

        if (rightNodeChildren.length > 0) {
            App.exportParser.children_recurse(rightChildId);
        }

        XMLString += "</node>\n";
    });

    XMLString += "</node>\n";
    XMLString += "</map>";
    return XMLString;
};

App.exportParser.children_recurse = function (childNodeId) {
    var childNode = Mindmaps.findOne({_id: childNodeId});

    if (!Boolean(childNode)){
        return;
    }

    var children = childNode.childSubTree;

    children.forEach(function (nodeId) {
        var name = Mindmaps.findOne({_id: nodeId}).name;

        XMLString += App.exportParser.nodeString(nodeId, name);

        App.exportParser.children_recurse(nodeId);

        XMLString += "</node>\n";
    });
};

App.exportParser.parseSymbols = function (nodeTextValue) {
    if (!Boolean(nodeTextValue)) {
        return "";
    }

    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    return nodeTextValue.replaceAll('&', '&amp;').replaceAll('"', "&quot;").replaceAll("'", '&apos;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
};

App.exportParser.nodeString = function (nodeId, nodeText, nodePosition) {
    if (Boolean(nodePosition)) {
        return "<node TEXT=\"" + App.exportParser.parseSymbols(nodeText) + "\" POSITION=\"" + nodePosition + "\">";
    }

    return "<node TEXT=\"" + App.exportParser.parseSymbols(nodeText) + "\">";
};
