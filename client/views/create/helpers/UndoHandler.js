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
    var returnStack =  new App.stackData(stackData.nodeData, newAction, stackData.destinationDirection,
        stackData.destinationIndex, null, stackData.keyPressed);
    returnStack.oldParentId = stackData.oldParentId;
    return returnStack;
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

            var targetNode = stackData.oldParentId ? App.map.getNodeDataWithNodeId(stackData.oldParentId) : stackData.nodeData.parent,
                destinationDirection = stackData.destinationDirection,
                destinationSubtree = App.Node.getSubTree(targetNode, destinationDirection);

            stackData.nodeData.index = destinationSubtree[stackData.destinationIndex] ? stackData.destinationIndex : destinationSubtree.length;

            if (targetNode.isCollapsed)
                App.expandRecursive(targetNode, targetNode._id);

            App.Node.addChild(targetNode, stackData.nodeData);

            return clone(stackData, "deleteNode");

        },
        deleteNode: function(stackData) {
            var parent = App.map.getNodeDataWithNodeId(stackData.oldParentId);
            if (parent && parent.isCollapsed) {
                App.expandRecursive(parent, stackData.oldParentId);
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
        },
        addNodeAfterCut: function(stackData) {
            var targetNode = stackData.oldParentId ? App.map.getNodeDataWithNodeId(stackData.oldParentId) : stackData.nodeData.parent,
                destinationDirection = stackData.destinationDirection,
                destinationSubtree = App.Node.getSubTree(targetNode, destinationDirection);

            stackData.nodeData.index = destinationSubtree[stackData.destinationIndex] ? stackData.destinationIndex : destinationSubtree.length;

            if (targetNode.isCollapsed)
                App.expandRecursive(targetNode, targetNode._id);

            App.Node.addChild(targetNode, stackData.nodeData);
            App.nodeCutToPaste = [];
            return clone(stackData, "cutNode");
        },

        cutNode: function(stackData) {
            var parent = App.map.getNodeDataWithNodeId(stackData.oldParentId);
            if (parent && parent.isCollapsed) {
                App.expandRecursive(parent, stackData.oldParentId);
            }
            //if (stackData.nodeData.childSubTree.length == 0) {
            //    App.Node.delete(stackData.nodeData);
            //    App.eventBinding.focusAfterDelete(stackData.nodeData, stackData.nodeData.index);
            //    App.nodeCutToPaste.push(stackData.nodeData);
            //    return clone(stackData, "addNodeAfterCut");
            //}

            App.Node.delete(stackData.nodeData);
            App.eventBinding.focusAfterDelete(stackData.nodeData, stackData.nodeData.index);
            App.nodeCutToPaste.push(stackData.nodeData);
            return clone(stackData, "addNodeAfterCut");
        },
        reposition: function(stackData) {
            var oldParent = App.map.getNodeDataWithNodeId(stackData.oldParentId),
                parentId = stackData.nodeData.parentId,
                parent = App.map.getNodeDataWithNodeId(parentId),
                dir = App.getDirection(stackData.nodeData),
                index = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree).map(function(_){return _._id}).indexOf(stackData.nodeData._id);

            App.Node.reposition(stackData.nodeData, oldParent);
            var returnStackData = clone(stackData);
            returnStackData.oldParentId = parentId;
            returnStackData.destinationDirection = dir;
            returnStackData.destinationIndex = index;
            return returnStackData;
        }

    },
    addToStack: function(stackData, stackName) {
        stackName = stackName ? stackName : "undo";
        return this.stack[stackName] ? this.stack[stackName].push(stackData) : "Error";
    },
//<<<<<<< Updated upstream
//     performAction: function(stackName) {
//         if(UndoRedo.stack[stackName].length > 0) {
//             var multipleUndo = this.stack[stackName].pop();
//             var multipleRedo = [];
//             var operationData = multipleUndo[0].operationData;
//             multipleUndo.forEach(function(stackData){
//                 var reverseStackData = UndoRedo.actions[stackData.operationData](stackData);
//                 if(reverseStackData != null)
//                     multipleRedo.push(reverseStackData);
//             });
//             if(multipleRedo.length > 0)
//                 UndoRedo.addToStack(operationData == "horizontalReposition" ? multipleRedo : multipleRedo.reverse(),
//                     (stackName == "undo" ? "redo" : "undo"));
//             App.clearAllSelected();
//         }
//     }
// };
//=======
 performAction: function(stackName) {
        if(UndoRedo.stack[stackName].length > 0) {
            var multipleUndo = this.stack[stackName].pop();
            var multipleRedo = [];
            var operationData = multipleUndo[0].operationData;

            if(multipleUndo.length==1){
                if(multipleUndo[0].operationData=="cutNode"){
                    var multipleUndo2=this.stack[stackName].pop();
                    if(multipleUndo2[0].operationData=="addNodeAfterCut"){
                        var reverseStackData = UndoRedo.actions[multipleUndo[0].operationData](multipleUndo[0]);
                        if(reverseStackData != null)
                            multipleRedo.push(reverseStackData);
                        var reverseStackData = UndoRedo.actions[multipleUndo2[0].operationData](multipleUndo2[0]);
                        if(reverseStackData != null)
                            multipleRedo.push(reverseStackData);

                    }
                }
                else {
                    multipleUndo.forEach(function (stackData) {
                        var reverseStackData = UndoRedo.actions[stackData.operationData](stackData);
                        if (reverseStackData != null)
                            multipleRedo.push(reverseStackData);
                    });
                }
            }
            else {
                      if(multipleUndo[0].operationData=="cutNode")
                      {
                          var multipleUndo2=this.stack[stackName].pop();
                              if(multipleUndo2[0].operationData=="addNodeAfterCut")
                              {
                                 multipleUndo.forEach(function (stackData) {

                                                var reverseStackData = UndoRedo.actions[stackData.operationData](stackData);
                                                if (reverseStackData != null)
                                                    multipleRedo.push(reverseStackData);
                                                });

                                 multipleUndo2.forEach(function (stackData) {

                                                var reverseStackData = UndoRedo.actions[stackData.operationData](stackData);
                                                if (reverseStackData != null)
                                                    multipleRedo.push(reverseStackData);
                                                });
                              }
                      }  else
                      {
                                          multipleUndo.forEach(function (stackData) {

                                                 var reverseStackData = UndoRedo.actions[stackData.operationData](stackData);
                                                 if (reverseStackData != null)
                                                     multipleRedo.push(reverseStackData);
                                                 });
                                       }



            }
            if (multipleRedo.length > 0)
                UndoRedo.addToStack(operationData == "horizontalReposition" ? multipleRedo : multipleRedo.reverse(),
                    (stackName == "undo" ? "redo" : "undo"));
            App.clearAllSelected();
        }
    }
};

//>>>>>>> Stashed changes

