App.presentation = {};
App.presentationArray = [];
App.lenght = 0;
App.index = 0;

App.presentation.prepareForPresentation = function() {
    alert("In presentation.");
    prepareArrayForNavigation();
};

var prepareArrayForNavigation = function() {

    var rootNode = Mindmaps.findOne({rootId : null});

    App.presentationArray = [];
    App.lenght = 0;

    App.presentationArray[App.lenght++] = rootNode._id;

    for(var i = 0; i < rootNode.right.length; i++) {
        var node = Mindmaps.findOne({_id : rootNode.right[i]});
        buildPresentationArray(node);
    }

    for(var i = 0; i < rootNode.left.length; i++) {
        var node = Mindmaps.findOne({_id : rootNode.left[i]});
        buildPresentationArray(node);
    }

};

var buildPresentationArray = function(node) {

    if(node == null) {
        return;
    }
    else {

        App.presentationArray[App.lenght++] = node._id;
        var childSubTree = node.childSubTree;

        for (var index in childSubTree) {
            var nextChildNode = Mindmaps.findOne({_id : childSubTree[index]});
            buildPresentationArray(nextChildNode);
        }

        if(isChildNode(node) == false) {
            App.toggleCollapsedNode(getD3Node(node._id));
        }
    }
};


var getD3Node = function(nodeId) {
    var d3Nodes = d3.selectAll(".node")[0];

    console.log("D3 Count : " + d3Nodes.length);

    for(var i = 0 ; i < d3Nodes.length; i++) {
        if(d3Nodes[i].__data__._id == nodeId) {
            console.log("Collasped Node : " + d3Nodes[i].__data__.name);
            return d3Nodes[i].__data__;
        }
    }
};


var isChildNode = function(node) {
    return node.childSubTree.length == 0;
}