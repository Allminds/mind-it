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

App.stackData = function(nodeData,operationData,destinationDirection,destinationIndex,oldParent) {
    this.nodeData = nodeData;
    this.operationData = operationData;
    this.destinationDirection = destinationDirection;
    this.destinationIndex = destinationIndex;
    this.oldParent = oldParent;
};

var clone = function(stackData, newAction) {
    return new App.stackData(stackData.nodeData, newAction, stackData.destinationDirection, stackData.destinationIndex, stackData.oldParent);
};

UndoRedo = {
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
        verticalReposition: function() {},
        horizontalReposition: function() {}
    },
    stack: {
        undo:[],
        redo:[]
    },
    addToStack: function(stackData, stackName) {
        stackName = stackName ? stackName : "undo";
        return this.stack[stackName] ? this.stack[stackName].push(stackData) : "Error";
    },
    performAction: function(stackName) {
        if(UndoRedo.stack[stackName].length > 0) {
            var stackData = this.stack[stackName].pop();
            var reverseStackData = UndoRedo.actions[stackData.operationData](stackData);
            UndoRedo.addToStack(reverseStackData, (stackName == "undo" ? "redo" : "undo"));
        }
    }
};



