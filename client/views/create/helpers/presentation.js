App.presentation = {};
App.presentationArray = [];
App.presentation.length = 0
App.index = 0;
App.presentation.previousNode = null;

App.presentation.prepareForPresentation = function() {
    alert("In presentation.");
    App.presentation.expandAll();
    App.presentationArray = [];
    App.presentation.length = 0;
    App.presentation.collapseAll();
};


App.presentation.expandAll = function () {
    prepareArrayForNavigation(true);
};


App.presentation.collapseAll = function () {
    prepareArrayForNavigation(false);
};


var prepareArrayForNavigation = function(ExpandTree) {

    var rootNode = Mindmaps.findOne({rootId : null});

    if(ExpandTree == false) {
        App.presentationArray = [];
        App.presentation.length = 0;
        App.presentation.previousNode = rootNode;
        App.presentationArray[App.presentation.length++] = rootNode._id;
    }

    for(var i = 0; i < rootNode.right.length; i++) {
        var node = Mindmaps.findOne({_id : rootNode.right[i]});
        if(ExpandTree == true) {
            expandSubTree(node);
        }
        else {
            collapseSubTree(node);
        }

    }

    for(var i = 0; i < rootNode.left.length; i++) {
        var node = Mindmaps.findOne({_id : rootNode.left[i]});
        if(ExpandTree == true) {
            expandSubTree(node);
        }
        else {
            collapseSubTree(node);
        }
    }

};

var collapseSubTree = function(node) {

    if(node == null) {
        return;
    }
    else {
        App.presentationArray[App.presentation.length++] = node._id;
        var childSubTree = node.childSubTree;

        for (var index in childSubTree) {
            var nextChildNode = Mindmaps.findOne({_id : childSubTree[index]});
            collapseSubTree(nextChildNode);
        }

        if(isChildNode(node) == false) {
            App.toggleCollapsedNode(App.presentation.getD3Node(node._id).__data__);
        }
    }
};

var expandSubTree = function(node) {

    if(node == null) {
        return;
    }
    else {

        if(isChildNode(node) == false) {
            var d3Node = App.presentation.getD3Node(node._id);
            if(d3Node.__data__.isCollapsed == true) {
                App.toggleCollapsedNode(App.presentation.getD3Node(node._id).__data__);
            }
        }

        var childSubTree = node.childSubTree;

        for (var index in childSubTree) {
            var nextChildNode = Mindmaps.findOne({_id : childSubTree[index]});
            expandSubTree(nextChildNode);
        }
    }
};



App.presentation.getD3Node = function(nodeId) {
    var d3Nodes = d3.selectAll(".node")[0];

    console.log("D3 Count : " + d3Nodes.length);

    for(var i = 0 ; i < d3Nodes.length; i++) {
        if(d3Nodes[i].__data__._id == nodeId) {
            return d3Nodes[i];
        }
    }
};


var isChildNode = function(node) {
    return node.childSubTree.length == 0;
};
