App.presentation = {};
App.presentationArray = [];
App.lenght = 0;
App.index = 0;
App.presentationMode = false;

App.presentation.prepareArrayForNavigation = function() {

    alert("Presentaion Mode");

    var rootNode = Mindmaps.findOne({rootId : null});

    App.presentation = [];

    var rootNodeChildSubTree = [];

    for(var i = 0; i < rootNode.right.length; i++) {
        rootNodeChildSubTree[i] = rootNode.right[i];
    }

    for(var i = 0; i < rootNode.left.length; i++) {
        rootNodeChildSubTree[i + rootNode.right.length] = rootNode.left[i];
    }

    rootNode.childSubTree = rootNodeChildSubTree;

    buildPresentationArray(rootNode);

};

var buildPresentationArray = function(node) {

    if(node == null) {
        return;
    }
    else {
        App.presentationArray[App.lenght++] = node._id
        var childSubTree = node.childSubTree;

        for (var index in childSubTree) {
            var nextChildNode = Mindmaps.findOne({_id : childSubTree[index]});
            buildPresentationArray(nextChildNode);
        }
    }
};
