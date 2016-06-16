App.exportParser = {};

App.exportParser.export = function (rootNodeName) {
    var exportedMindmapString = App.JSONConverter();
    if (!Boolean(exportedMindmapString)) {
        alert('Invalid mindmap, can not be exported.');

        return;
    }

    var blob = new Blob([exportedMindmapString], {type: "text/plain;charset=utf-8"});
    App.saveAs(blob, rootNodeName + ".mm");
};

var nodesString = function (nodes, direction) {
    var xmlString = '';

    nodes.forEach(function (nodeId) {
        var node = Mindmaps.findOne({_id: nodeId});

        if (Boolean(node)) {
            xmlString += App.exportParser.nodeString(node.name, direction);

            xmlString += nodesString(node.childSubTree);

            xmlString += "</node>\n";
        }
    });

    return xmlString;
};

App.JSONConverter = function () {
    var xmlString = '';
    var rootNode = App.presentation.getRootNode();

    if (Boolean(rootNode)) {
        xmlString = "<map version=\"1.0.1\">\n";

        xmlString += App.exportParser.nodeString(rootNode.name);

        xmlString += nodesString(rootNode.left, App.Constants.Direction.LEFT);

        xmlString += nodesString(rootNode.right, App.Constants.Direction.RIGHT);

        xmlString += "</node>\n";

        xmlString += "</map>";
    }

    return xmlString;
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

App.exportParser.nodeString = function (nodeText, nodePosition) {
    if (Boolean(nodePosition)) {
        return "<node TEXT=\"" + App.exportParser.parseSymbols(nodeText) + "\" POSITION=\"" + nodePosition + "\">";
    }

    return "<node TEXT=\"" + App.exportParser.parseSymbols(nodeText) + "\">";
};
