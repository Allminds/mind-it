Template.PresentImageButton.events({
    'click': function () {
        App.presentation.preparePresentationUI();
    }
});

App.presentation = {};
App.presentation.presentationArray = [];
App.presentation.length = 0;
App.presentation.index = 0;
App.presentation.previousNode = null;
App.presentation.presentationMode = false;
App.presentation.initialSetup = false;


App.presentation.getRootNode = function () {
    var root = d3.select(".node.level-0")[0][0].__data__._id;
    return Mindmaps.findOne({rootId: null, _id: root});
};

App.presentation.preparePresentationUI = function () {
    if (screenfull.enabled) {
        screenfull.request();
    }

    $("#topBarDiv").hide();
    $("#onlineUsers").hide();

    App.presentation.collapseAllMindmap();
    var rootNode = App.presentation.getRootNode();

    var d3Node = App.presentation.getD3Node(rootNode._id);

    App.deselectNode();
    d3.select(d3Node).classed("selected", true);
    App.clearAllSelected();

    App.getChartInFocus();

    App.presentation.index = 0;
};

var show_hide_header = function () {
    if (App.presentation.presentationMode == true) {
        //update UI add topbar
        $("#topBarDiv").show();
        $("#onlineUsers").show();
        App.presentation.presentationMode = false;
    } else {
        App.getChartInFocus();
        App.presentation.presentationMode = true;
    }
};

document.addEventListener(screenfull.raw.fullscreenchange, show_hide_header);

App.presentation.collapseAllMindmap = function () {
    //Expand code.
    App.presentation.expandAll();
    App.presentation.presentationArray = [];
    App.presentation.length = 0;

    //Collapse code.
    App.presentation.initialSetup = true;
    App.presentation.collapseAll();

    App.chart.update();

    App.presentation.initialSetup = false;
};

App.presentation.expandAll = function () {
    performExpandAllCollapseAll(expandSubTree);
};

App.presentation.collapseAll = function () {
    var rootNode = App.presentation.getRootNode();

    App.presentation.presentationArray = [];
    App.presentation.length = 0;
    App.presentation.previousNode = rootNode;
    App.presentation.presentationArray[App.presentation.length++] = rootNode._id;

    performExpandAllCollapseAll(collapseSubTree);
};

var performExpandAllCollapseAll = function (operationToBePerformed) {
    var rootNode = App.presentation.getRootNode();

    for (var rightNodeCounter = 0; rightNodeCounter < rootNode.right.length; rightNodeCounter++) {
        var rightNode = Mindmaps.findOne({_id: rootNode.right[rightNodeCounter]});
        operationToBePerformed(rightNode);
    }

    for (var leftNodeCounter = 0; leftNodeCounter < rootNode.left.length; leftNodeCounter++) {
        var leftNode = Mindmaps.findOne({_id: rootNode.left[leftNodeCounter]});
        operationToBePerformed(leftNode);
    }
};

var collapseSubTree = function (node) {
    if (node === null) {
        return;
    }
    else {
        App.presentation.presentationArray[App.presentation.length++] = node._id;

        var childSubTree = node.childSubTree;

        for (var index in childSubTree) {
            var nextChildNode = Mindmaps.findOne({_id: childSubTree[index]});
            collapseSubTree(nextChildNode);
        }

        if (isChildNode(node) == false) {
            App.toggleCollapsedNode(App.presentation.getD3Node(node._id).__data__);
        }
    }
};

var expandSubTree = function (node) {
    if (node === null) {
        return;
    }
    else {

        if (isChildNode(node) == false) {
            var d3Node = App.presentation.getD3Node(node._id);
            if (d3Node.__data__.isCollapsed == true) {
                App.toggleCollapsedNode(d3Node.__data__);
            }
        }

        var childSubTree = node.childSubTree;

        for (var index in childSubTree) {
            var nextChildNode = Mindmaps.findOne({_id: childSubTree[index]});
            expandSubTree(nextChildNode);
        }
    }
};

App.presentation.getD3Node = function (nodeId) {
    var d3Nodes = d3.selectAll(".node")[0];

    for (var nodeCounter = 0; nodeCounter < d3Nodes.length; nodeCounter++) {
        if (d3Nodes[nodeCounter].__data__._id == nodeId) {
            return d3Nodes[nodeCounter];
        }
    }
};

App.presentation.moveCursorToNextNode = function () {
    setIndexValue();

    var currentD3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);

    if (currentD3Node.__data__.isCollapsed == true) {
        App.toggleCollapsedNode(currentD3Node.__data__);
    }

    App.presentation.index = (App.presentation.index + 1) % App.presentation.presentationArray.length;

    var d3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);

    App.deselectNode();
    d3.select(d3Node).classed("selected", true);
    App.clearAllSelected();

    if (App.presentation.previousNode.depth > d3Node.__data__.depth) {
        var difference = App.presentation.previousNode.depth - d3Node.__data__.depth;
        for (var i = 0; i < difference; i++) {
            App.toggleCollapsedNode(App.presentation.previousNode.parent);
            App.presentation.previousNode = App.presentation.previousNode.parent;
        }
    }

    App.presentation.previousNode = d3Node.__data__;
};

App.presentation.moveCursorToPreviousNode = function () {
    var d3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);

    if (d3Node.__data__.childSubTree != null && d3Node.__data__.isCollapsed == false) {
        App.toggleCollapsedNode(d3Node.__data__);
    }

    App.presentation.index = (App.presentation.index + App.presentation.presentationArray.length - 1) % App.presentation.presentationArray.length;

    var dbNode = Mindmaps.findOne(App.presentation.presentationArray[App.presentation.index]);

    expandParentRecursively(dbNode._id);

    d3Node = App.presentation.getD3Node(App.presentation.presentationArray[App.presentation.index]);

    App.deselectNode();
    d3.select(d3Node).classed("selected", true);
    App.clearAllSelected();

    if (App.presentation.previousNode.depth > d3Node.__data__.depth) {
        App.toggleCollapsedNode(App.presentation.previousNode.parent);
    }

    App.presentation.previousNode = d3Node.__data__;
};

var setIndexValue = function () {
    var id = d3.select(".selected")[0][0].__data__._id;

    App.presentation.index = App.presentation.presentationArray.indexOf(id);
};

var expandParentRecursively = function (nodeId) {
    var d3Node = App.presentation.getD3Node(nodeId);

    if (d3Node == null) {
        var dbNode = Mindmaps.findOne({_id: nodeId});
        expandParentRecursively(dbNode.parentId);
    }

    d3Node = App.presentation.getD3Node(nodeId);

    if (d3Node.__data__.isCollapsed == true) {
        App.toggleCollapsedNode(d3Node.__data__);
    }
};

var isChildNode = function (node) {
    return node.childSubTree.length == 0;
};
