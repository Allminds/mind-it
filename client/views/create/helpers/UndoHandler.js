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


var clone = function(stackData, newAction) {
    newAction = newAction ? newAction : stackData.operationData;
    return new App.stackData(stackData.nodeData, newAction, stackData.destinationDirection,
        stackData.destinationIndex, stackData.oldParentId, stackData.keyPressed);
};

var UndoRedo = {
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
            var oldParentId = stackData.nodeData.parent._id;
            var selectedIndex = App.Node.getIndexOfNode(stackData.nodeData);
            var direction = App.Node.getDirection(stackData.nodeData);
            var parent = App.map.getNodeDataWithNodeId(stackData.oldParentId);
            App.Node.reposition(stackData.nodeData, parent, null, stackData.destinationIndex);
            var returnStackData = clone(stackData);
            returnStackData.destinationDirection = direction;
            returnStackData.selectedIndex = selectedIndex;
            returnStackData.oldParentId = oldParentId;

            return returnStackData
        },
        rename: function(stackData) {
            var nodeData = stackData.nodeData;
            var oldName = App.map.getNodeDataWithNodeId(nodeData._id).name;
            if(oldName == nodeData.name) {
                App.RepeatHandler.undo();
                return null;
            }
            mindMapService.updateNode(nodeData._id, {name: nodeData.name});
            nodeData.name = oldName;
            return clone(stackData);
        },
        toggleCollapse: function(stackData) {
            App.toggleCollapsedNode(stackData.nodeData);
            return clone(stackData);
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
                if(reverseStackData != null)
                    multipleRedo.push(reverseStackData);
            });
            if(multipleRedo.length > 0)
                UndoRedo.addToStack(multipleRedo, (stackName == "undo" ? "redo" : "undo"));
            App.clearAllSelected();
        }
    }
};




