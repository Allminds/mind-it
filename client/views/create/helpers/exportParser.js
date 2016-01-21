App.exportParser={};

App.exportParser.export = function (rootNodeName) {
    var XMLString = App.JSONConverter();
    var blob = new Blob([XMLString], {type: "text/plain;charset=utf-8"});
    App.saveAs(blob, rootNodeName + ".mm");
};
//newly Added
var createNodesDataString = function(nodesArray){
    var dataString = '';
    for(var i=0; i<nodesArray.length; i++){
        dataString +=  JSON.stringify(nodesArray[i]) + '!@#$%^&*(*&^%$#';
    }
    return dataString;
};

var createDBBackUp = function() {
    return createNodesDataString(Mindmaps.find({}).fetch());
};

App.exportParser.createDBBackUpFile = function(fileName){
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {

        fs.root.getFile(fileName, {create: true}, function (fileEntry) {

        var blobData = createDBBackUp();

        fileEntry.createWriter(function (fileWriter) {
            var blob = new Blob([blobData]);
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
//Newly added
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