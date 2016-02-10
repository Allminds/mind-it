/**
 * Created by rmoitra on 09/02/16.
 */


xdescribe("undo / redo", function() {
    var root, parent, left1, child1, child2, child3;
    beforeEach(function () {
        root = new App.Node("root", "root", null, 0);
        root._id = "root";

        parent = new App.Node("parent", "right", root, 0);
        parent._id = "parent";
        parent.parent = root;

        left1 = new App.Node("left1", "left", root, 0);
        left1._id = "left1";
        left1.parent = root;
        child1 = new App.Node("child1", "left", left1, 0);
        child1._id = "child1";
        child2 = new App.Node("child2", "left", left1, 1);
        child2._id = "child2";
        child3 = new App.Node("child3", "left", left1, 1);
        child3._id = "child3";
        child1.parent = left1;
        child2.parent = left1;
        child3.parent = left1;
        root.left = [left1];
        left1.childSubTree = [child1, child2, child3];

        root.right.push(parent);
        root.left.push(left1);
    });

    describe("previous actions should be maintained in stack for undo/redo", function () {
        it("should push deletion of the new node into undoStack when new node is added", function () {
            var newNodeData = {_id: "2", parent: root, position: "right"};
            App.nodeStore[newNodeData._id] = newNodeData;
            var enterAction = function () {
                return newNodeData;
            };
            spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(root);
            spyOn(App.eventBinding, "afterNewNodeAddition");

            App.eventBinding.newNodeAddAction(enterAction);

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(undoData.operationData).toBe("delete");
            expect(undoData.nodeData).toBe(newNodeData);
        });

        it("should push addition of the new node into undoStack when new node is deleted", function () {
            var obj = {__data__: parent};
            spyOn(App.eventBinding, "focusAfterDelete");
            spyOn(d3, "selectAll").and.returnValue([[obj]]);
            spyOn(App.Node, "delete").and.returnValue(0);
            App.multiSelectedNodes = [obj];

            App.eventBinding.deleteAction();

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(App.eventBinding.focusAfterDelete).toHaveBeenCalled();
            expect(App.Node.delete).toHaveBeenCalledWith(parent);
            expect(undoData.operationData).toBe("add");
            expect(undoData.nodeData).toBe(parent);
        });

        it("should push vertical reposition down of node into UndoStack when node is repositioned upwards", function () {
            App.multiSelectedNodes = [{__data__: child3}];
            spyOn(App.Node, "verticalReposition");
            spyOn(App.Node, "isDeleted").and.returnValue(false);

            App.eventBinding.upRepositionAction();

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(undoData.operationData).toBe("Vertical Reposition Down");
            expect(undoData.nodeData).toBe(child3);
            expect(App.Node.verticalReposition).toHaveBeenCalled();
        });

        it("should push vertical reposition up of node into UndoStack when node is repositioned downwards", function () {
            App.multiSelectedNodes = [{__data__: child3}];
            spyOn(App.Node, "verticalReposition");
            spyOn(App.Node, "isDeleted").and.returnValue(false);

            App.eventBinding.downRepositionAction();

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(undoData.operationData).toBe("Vertical Reposition Up");
            expect(undoData.nodeData).toBe(child3);
            expect(App.Node.verticalReposition).toHaveBeenCalled();
        });

    });


    xdescribe("undo operations", function () {
        it("should be able to undo insertion of new node", function () {
            var stackData = new App.stackData(parent, "delete");
            UndoRedo.stack.undo.push([stackData]);
            spyOn(App.eventBinding, "focusAfterDelete");

            App.eventBinding.undoAction();

            var redoData = UndoRedo.stack.redo.pop()[0];
            expect(App.eventBinding.focusAfterDelete).toHaveBeenCalled();
            expect(root.right.length).toBe(0);
            expect(redoData.nodeData).toBe(stackData.nodeData);
            expect(redoData.operationData).toBe("add");
        });

        it("should be able to undo deletion of node", function () {
            var stackData = new App.stackData(parent, "add");
            stackData.destinationDirection = "right";
            UndoRedo.stack.undo = [[stackData]];

            App.eventBinding.undoAction();

            var redoData = UndoRedo.stack.redo.pop()[0];
            expect(root.right[0]).toBe(parent);
            expect(redoData.nodeData).toBe(stackData.nodeData);
            expect(redoData.operationData).toBe("delete");
        });

        it("should be able to undo upwards vertical reposition of node ", function () {
            spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(child3);
            spyOn(App.Node, "verticalReposition");
            var stackData = new App.stackData(child3, "Vertical Reposition Down");
            stackData.destinationDirection = "left";
            UndoRedo.stack.undo.push([stackData]);

            App.eventBinding.undoAction();

            var redoData = UndoRedo.stack.redo.pop()[0];
            expect(App.Node.verticalReposition).toHaveBeenCalledWith(stackData.nodeData, App.Constants.KeyPressed.DOWN);
            expect(redoData.nodeData).toBe(stackData.nodeData);
            expect(redoData.operationData).toBe("Vertical Reposition Up");
        });

        it("should be able to undo downwards vertical reposition of node ", function () {
            spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(child3);
            spyOn(App.Node, "verticalReposition");
            var stackData = new App.stackData(child3, "Vertical Reposition Up");
            stackData.destinationDirection = "left";
            UndoRedo.stack.undo.push([stackData]);

            App.eventBinding.undoAction();

            var redoData = UndoRedo.stack.redo.pop()[0];
            expect(App.Node.verticalReposition).toHaveBeenCalledWith(stackData.nodeData, App.Constants.KeyPressed.UP);
            expect(redoData.nodeData).toBe(stackData.nodeData);
            expect(redoData.operationData).toBe("Vertical Reposition Down");
        });
    });

    xdescribe("redo operations", function () {
        it("should be able to redo insertion of new node", function () {
            var stackData = new App.stackData(parent, "add");
            stackData.destinationDirection = "right";
            UndoRedo.stack.redo = [[stackData]];

            App.eventBinding.redoAction();

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(undoData.operationData).toBe("delete");
            expect(undoData.nodeData).toBe(stackData.nodeData);
        });

        it("should be able to redo deletion of new node", function () {
            var stackData = new App.stackData(parent, "delete");
            stackData.destinationDirection = "right";
            spyOn(App.eventBinding, "focusAfterDelete");
            UndoRedo.stack.redo.push([stackData]);

            App.eventBinding.redoAction();

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(App.eventBinding.focusAfterDelete).toHaveBeenCalled();
            expect(root.right.length).toBe(0);
            expect(undoData.operationData).toBe("add");
            expect(undoData.nodeData).toBe(stackData.nodeData);
        });

        it("should be able to redo upwards vertical reposition of node", function () {
            spyOn(App.Node, "verticalReposition");
            var stackData = new App.stackData(child3, "Vertical Reposition Up");
            stackData.destinationDirection = "left";
            UndoRedo.stack.redo.push([stackData]);

            App.eventBinding.redoAction();

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(undoData.operationData).toBe("Vertical Reposition Down");
            expect(undoData.nodeData).toBe(stackData.nodeData);
            expect(App.Node.verticalReposition).toHaveBeenCalledWith(stackData.nodeData, App.Constants.KeyPressed.UP)
        });

        it("should be able to redo downwards vertical reposition of node", function () {
            spyOn(App.Node, "verticalReposition");
            var stackData = new App.stackData(child3, "Vertical Reposition Down");
            stackData.destinationDirection = "left";
            UndoRedo.stack.redo.push([stackData]);

            App.eventBinding.redoAction();

            var undoData = UndoRedo.stack.undo.pop()[0];
            expect(stack.operationData).toBe("Vertical Reposition Up");
            expect(undoData.nodeData).toBe(stackData.nodeData);
            expect(App.Node.verticalReposition).toHaveBeenCalledWith(stackData.nodeData, App.Constants.KeyPressed.DOWN)
        });
    });
});