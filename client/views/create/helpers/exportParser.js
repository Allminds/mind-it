App.exportParser={};

App.exportParser.export = function (rootNodeName) {
    var XMLString = null;
    XMLString = App.JSONConverter();
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {

        fs.root.getFile(rootNodeName+'.mm', {create: true}, function (fileEntry) {

            fileEntry.createWriter(function (fileWriter) {
                fileWriter.truncate(0);
            }, function () {
            });

            fileEntry.createWriter(function (fileWriter) {
                var blob = new Blob([XMLString]);
                fileWriter.write(blob);
                fileWriter.addEventListener("writeend", function () {
                    window.open(fileEntry.toURL(), '_blank');
                }, false);
            }, function () {
            });
        }, function () {
        });
    }, function () {
    });
};

var XMLString = [];
App.JSONConverter = function () {

    XMLString = "<map version=\"1.0.1\">\n";
    var rootNode = Mindmaps.find({position: null , rootId: null}).fetch()[0];

    XMLString += "<node ID=\"" + rootNode._id + "\" TEXT=\"" + rootNode.name + "\" >\n";

    var leftChildren = rootNode.left;
    var rightChildren = rootNode.right;

    leftChildren.forEach(function (nodePassed) {

        var id = "" + nodePassed;
        var name = Mindmaps.find({_id: id}).fetch()[0].name;

        XMLString += "<node ID=\"" + id + "\" TEXT=\"" + name + "\" POSITION=\"left\"" + " >\n";

        children_recurse(id);

        XMLString += "</node>\n";

    });
    rightChildren.forEach(function (nodePassed) {

        var id = "" + nodePassed;
        var name = Mindmaps.find({_id: id}).fetch()[0].name;

        XMLString += "<node ID=\"" + id + "\" TEXT=\"" + name + "\" POSITION=\"right\"" + " >\n";

        children_recurse(id);

        XMLString += "</node>\n";
    });

    XMLString += "</node>\n";
    XMLString += "</map>";
    //console.log(XMLString);
    return XMLString;
};


var children_recurse = function (id) {

    var node = Mindmaps.find({_id: id}).fetch()[0];
    var children = node.childSubTree;

    children.forEach(function (_) {
        var id = "" + _;
        var name = Mindmaps.find({_id: id}).fetch()[0].name;
        XMLString += "<node ID=\"" + id + "\" TEXT=\"" + name + "\" >\n";
        children_recurse(id);
        XMLString += "</node>\n";
    });

};