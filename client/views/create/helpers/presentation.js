Template.PresentImageButton.events({
    'click #PresentationImageButton': function(){
        App.presentation.preparePresentationUI();
    }
});


App.presentation = {};
App.presentation.presentationArray = [];
App.presentation.length = 0;
App.presentation.index = 0;
App.presentation.previousNode = null;
App.presentation.presentationMode = false;
App.presentation.topbarHTML  = "";

App.presentation.preparePresentationUI = function(){
    var div = document.getElementById("topBarDiv"); //remove topbar in presentation mode.
    var onlineUsers = document.getElementById("onlineUsers");
    var feedbackButton = document.getElementById("feedbackImageButton");
    App.presentation.topbarHTML = $("div#topBarDiv").html();

    if (screenfull.enabled) {
        screenfull.request();
    }
    div.style.display='none';
    onlineUsers.style.display='none';
    feedbackButton.style.display='none';
    App.presentation.prepareForPresentation();
    var rootNode = Mindmaps.findOne({rootId : null});
    var d3Node = App.presentation.getD3Node(rootNode._id);

    App.deselectNode();
    d3.select(d3Node).classed("selected", true);
    App.clearAllSelected();
    App.presentation.index = 0;
};
$( document ).ready(function() {
    $(document).on(screenfull.raw.fullscreenchange, function () {
        if(App.presentation.presentationMode == true){
            //update UI add topbar
            var div = document.getElementById("topBarDiv");
            var onlineUsers = document.getElementById("onlineUsers");
            var feedbackButton = document.getElementById("feedbackImageButton");
            div.style.display='block';
            onlineUsers.style.display='block';
            feedbackButton.style.display='block';
            console.log("inner",App.presentation.topbarHTML);
            //div.innerHTML = App.presentation.topbarHTML;
            App.presentation.expandAll();
            App.presentation.presentationMode = false;
        }else{
            App.presentation.presentationMode = true;
        }
    });
});

App.presentation.prepareForPresentation = function() {
    App.presentation.expandAll();
    App.presentation.presentationArray = [];
    App.presentation.length = 0;
    App.presentation.collapseAll();
    alert("MindIt is In presentation Mode..Use Presentation remote for Node Navigation");
    //App.presentation.presentationMode = true;
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
        App.presentation.presentationArray = [];
        App.presentation.length = 0;
        App.presentation.previousNode = rootNode;
        App.presentation.presentationArray[App.presentation.length++] = rootNode._id;
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
        App.presentation.presentationArray[App.presentation.length++] = node._id;
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

    for(var i = 0 ; i < d3Nodes.length; i++) {
        if(d3Nodes[i].__data__._id == nodeId) {
            return d3Nodes[i];
        }
    }
};

App.presentation.moveCursorToNextNode = function() {
    setIndexValue();

    var currentD3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);

    if(currentD3Node.__data__.isCollapsed == true) {
        App.toggleCollapsedNode(currentD3Node.__data__);
    }

    App.presentation.index = (App.presentation.index + 1) % App.presentation.presentationArray.length;

    var d3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);


    App.deselectNode();
    d3.select(d3Node).classed("selected", true);
    App.clearAllSelected();


    if(App.presentation.previousNode.depth > d3Node.__data__.depth) {
        var difference = App.presentation.previousNode.depth - d3Node.__data__.depth;
        for(var i = 0 ; i < difference ; i++) {
            App.toggleCollapsedNode(App.presentation.previousNode.parent);
            App.presentation.previousNode = App.presentation.previousNode.parent;
        }
    }


    App.presentation.previousNode = d3Node.__data__;
};


App.presentation.moveCursorToPreviousNode = function() {

    var d3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);

    if(d3Node.__data__.childSubTree != null && d3Node.__data__.isCollapsed == false) {
        App.toggleCollapsedNode(d3Node.__data__);
    }

    App.presentation.index = (App.presentation.index + App.presentation.presentationArray.length - 1) % App.presentation.presentationArray.length;

    var dbNode = Mindmaps.findOne(App.presentation.presentationArray[App.presentation.index]);

    expandParentRecursively(dbNode._id);

    d3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);


    App.deselectNode();
    d3.select(d3Node).classed("selected", true);
    App.clearAllSelected();

    if(App.presentation.previousNode.depth > d3Node.__data__.depth) {
        App.toggleCollapsedNode(App.presentation.previousNode.parent);
    }

    if(d3Node.__data__.isCollapsed == true) {
        App.toggleCollapsedNode(d3Node.__data__);
    }

    App.presentation.previousNode = d3Node.__data__;
};


var setIndexValue = function () {
    var id = d3.select(".selected")[0][0].__data__._id;

    App.presentation.index = App.presentation.presentationArray.indexOf(id);
};

var expandParentRecursively = function (nodeId) {

    var d3Node = App.presentation.getD3Node(nodeId);

    if(d3Node == null) {
        var dbNode = Mindmaps.findOne({_id : nodeId});
        expandParentRecursively(dbNode.parentId);
    }

    d3Node = App.presentation.getD3Node(nodeId);

    if(d3Node.__data__.isCollapsed == true) {
        App.toggleCollapsedNode(d3Node.__data__);
    }
};

var isChildNode = function(node) {
    return node.childSubTree.length == 0;
};
