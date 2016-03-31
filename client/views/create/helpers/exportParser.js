App.exportParser={};

App.exportParser.export = function (rootNodeName) {
    var XMLString = App.JSONConverter();
    var blob = new Blob([XMLString], {type: "text/plain;charset=utf-8"});
    App.saveAs(blob, rootNodeName + ".mm");
};

var XMLString = [];
App.JSONConverter = function () {
    XMLString = "<map version=\"1.0.1\">\n";
    var rootNode = Mindmaps.findOne({position: null , rootId: null});
    XMLString += "<node ID=\"" + rootNode._id + "\" TEXT=\"" + parseSymbols(rootNode.name) + "\" >\n";
    var leftChildren = rootNode.left;
    var rightChildren = rootNode.right;

    leftChildren.forEach(function (nodePassed) {
        var id = "" + nodePassed;
        var name = Mindmaps.find({_id: id}).fetch()[0].name;
        XMLString += "<node ID=\"" + id + "\" TEXT=\"" + parseSymbols(name) + "\" POSITION=\"left\"" + " >\n";
        App.exportParser.children_recurse(id);
        XMLString += "</node>\n";
    });
    rightChildren.forEach(function (nodePassed) {
        var id = "" + nodePassed;
        var name = Mindmaps.find({_id: id}).fetch()[0].name;
        XMLString += "<node ID=\"" + id + "\" TEXT=\"" + parseSymbols(name) + "\" POSITION=\"right\"" + " >\n";
        App.exportParser.children_recurse(id);
        XMLString += "</node>\n";
    });

    XMLString += "</node>\n";
    XMLString += "</map>";
    return XMLString;

    //<map version="1.0.1">\n<node ID="qRbTTPjHzfoGAmW3b" TEXT="testtxt" >\n</node>\n</map>
    //"<map version=\"1.0.1\">\n<node ID=\"" + rootNode._id + "\" TEXT=\"" + parseSymbols(rootNode.name) + "\" >\n
};

var parseSymbols = function(name){
    return name.replace('&', '&amp;').replace('"', "&quot;").replace("'", '&apos;').replace('<', '&lt;').replace('>', '&gt;');
};


//var children_recurse = function (id) {
//    var node = Mindmaps.find({_id: id}).fetch()[0];
//    var children = node.childSubTree;
//
//    children.forEach(function (_) {
//        var id = "" + _;
//        var name = Mindmaps.find({_id: id}).fetch()[0].name;
//        XMLString += "<node ID=\"" + id + "\" TEXT=\"" + name + "\" >\n";
//        children_recurse(id);
//        XMLString += "</node>\n";
//    });
//
//};
App.exportParser.children_recurse = function (id) {
    var node = Mindmaps.find({_id: id}).fetch()[0];
    var children = node.childSubTree;

    children.forEach(function (_) {
        var id = "" + _;
        var name = Mindmaps.findOne({_id: id}).name;
        XMLString += "<node ID=\"" + id + "\" TEXT=\"" + name + "\" >\n";
        children_recurse(id);
        XMLString += "</node>\n";
    });

};