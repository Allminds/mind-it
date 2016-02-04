App.RepeatHandler = {
    undo: function() {
        UndoRedo.performAction("undo");
    },
    redo: function() {
        UndoRedo.performAction("redo");
    },
    addToActionStack: function(stackData, stackName) {
        stackName = stackName ? stackName : "undo";
        if(stackName == "undo")
            UndoRedo.stack.redo = [];
        UndoRedo.addToStack(stackData, stackName);
    }
};

App.stackData = function(nodeData,operationData,destinationDirection,destinationIndex,oldParent, keyPressed) {
    this.nodeData = nodeData;
    this.operationData = operationData;
    this.destinationDirection = destinationDirection;
    this.destinationIndex = destinationIndex;
    this.oldParent = oldParent;
    this.keyPressed = keyPressed;
};

var clone = function(stackData, newAction) {
    newAction = newAction ? newAction : stackData.operationData;
    return new App.stackData(stackData.nodeData, newAction, stackData.destinationDirection,
        stackData.destinationIndex, stackData.oldParent, stackData.keyPressed);
};

UndoRedo = {
    stack: {
        undo:[],
        redo:[]
    },
    actions: {
        addNode: function(stackData) {
            if(App.Node.isDeleted(stackData.nodeData.parent))
                return;

            var targetNode = stackData.nodeData.parent,
                destinationDirection = stackData.destinationDirection,
                destinationSubtree = App.Node.getSubTree(targetNode, destinationDirection);

            stackData.nodeData.index = destinationSubtree[stackData.nodeData.index] ? stackData.nodeData.index : destinationSubtree.length;

            if (targetNode.isCollapsed)
                App.expandRecursive(targetNode, targetNode._id);

            App.Node.addChild(targetNode, stackData.nodeData);
            App.clearAllSelections();
            App.selectNode(stackData.nodeData);

            return clone(stackData, "deleteNode");

        },
        deleteNode: function(stackData) {
            if (stackData.nodeData.parent.isCollapsed) {
                App.expandRecursive(stackData.nodeData.parent, stackData.nodeData.parent._id);
            }
            if (stackData.nodeData.childSubTree.length == 0) {
                App.Node.delete(stackData.nodeData);
                App.eventBinding.focusAfterDelete(stackData.nodeData, stackData.nodeData.index);

                return clone(stackData, "addNode");
            }
        },
        verticalReposition: function(stackData) {
            var node = stackData.nodeData;
            if (!(node && node.parent))
                return;

            var newKeyPressed = stackData.keyPressed == App.Constants.KeyPressed.UP ? App.Constants.KeyPressed.DOWN : App.Constants.KeyPressed.UP;
            App.Node.verticalReposition(node, stackData.keyPressed);

            var returnStackData = clone(stackData);
            returnStackData.keyPressed = newKeyPressed;
            return returnStackData;
        },
        horizontalReposition: function(stackData) {
            var destinationSubTree = App.Node.isRoot(stackData.nodeData.parent) ? stackData.nodeData.parent[stackData.destinationDirection] : stackData.nodeData.parent.childSubtree;
            var oldParent = stackData.nodeData.parent;
            var selectedIndex = App.Node.getIndexOfNode(stackData.nodeData);
            var direction = App.Node.getDirection(stackData.nodeData);
            App.Node.reposition(stackData.nodeData,stackData.oldParent, destinationSubTree, stackData.destinationIndex);
            var stackData1 = clone(stackData);
            stackData1.destinationDirection = direction;
            stackData1.selectedIndex = selectedIndex;
            stackData1.oldParent = oldParent;

            return stackData1
        }
    },
    addToStack: function(stackData, stackName) {
        stackName = stackName ? stackName : "undo";
        return this.stack[stackName] ? this.stack[stackName].push(stackData) : "Error";
    },
    performAction: function(stackName) {
        if(UndoRedo.stack[stackName].length > 0) {
            var multipleUndo = this.stack[stackName].pop();
            var multipleRedo = [];
            multipleUndo.forEach(function(stackData){
                var reverseStackData = UndoRedo.actions[stackData.operationData](stackData);
                multipleRedo.push(reverseStackData);
            });
            UndoRedo.addToStack(multipleRedo, (stackName == "undo" ? "redo" : "undo"));
        }
    }
};




