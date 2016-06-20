App.exportParser = {};

App.exportParser.export = function (rootNodeName) {
    var exportedMindmapString = App.JSONConverter();

    if (!Boolean(exportedMindmapString)) {
        alert('Invalid mindmap, can not be exported.');
        return;
    }

    var mindMapExportFileName = rootNodeName + App.Constants.MindmapFileExtension;

    var blob = new Blob([exportedMindmapString], {type: "text/plain;charset=utf-8"});
    App.saveAs(blob, mindMapExportFileName);
};

var nodeEnd = function () {
    return "</node>\n";
};

var nodesToXmlString = function (nodes, direction) {
    var xmlString = '';

    nodes.forEach(function (nodeId) {
        var node = Mindmaps.findOne({_id: nodeId});

        if (Boolean(node)) {
            xmlString += App.exportParser.nodeStart(node.name, direction);

            xmlString += nodesToXmlString(node.childSubTree);

            xmlString += nodeEnd();
        }
    });

    return xmlString;
};

var mapEnd = function () {
    return "</map>";
};

var mapStart = function () {
    return "<map version=\"1.0.1\">\n";
};

App.JSONConverter = function () {
    var xmlString = '';
    var rootNode = App.presentation.getRootNode();

    if (Boolean(rootNode)) {
        xmlString += mapStart();
        xmlString += App.exportParser.nodeStart(rootNode.name);

        xmlString += nodesToXmlString(rootNode.left, App.Constants.Direction.LEFT);

        xmlString += nodesToXmlString(rootNode.right, App.Constants.Direction.RIGHT);

        xmlString += nodeEnd();
        xmlString += mapEnd();
    }

    return xmlString;
};

App.exportParser.nodeStart = function (nodeText, nodePosition) {
    if (Boolean(nodePosition)) {
        return "<node TEXT=\"" + App.Reform.XmlAttributeEncode(nodeText) + "\" POSITION=\"" + nodePosition + "\">";
    }

    return "<node TEXT=\"" + App.Reform.XmlAttributeEncode(nodeText) + "\">";
};
