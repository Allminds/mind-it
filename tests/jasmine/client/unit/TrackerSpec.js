describe('Tracker.js', function () {
    it("should have called Meteor method to update map count", function () {
        spyOn(Meteor, "call");
        App.setMapsCount();
        expect(Meteor.call).toHaveBeenCalled();
    });

    it("Should add node to the subtree of given parent", function () {
        var parent = new App.Node('parent');
        parent._id = 'parentId';
        parent.isCollapsed = true;

        spyOn(App.map, "getNodeDataWithNodeId").and.callFake(function () {
            return parent;
        });

        App.tracker.updateSubtree(parent._id, {childSubTree: ["dummy id"]}, "childSubTree");
        expect(parent.childSubTree.length).toBe(1);
    });

    it("Should update name of given node", function () {
        var node = {name: "dummY"};
        App.tracker.updateNameOfNode(node, {name: "updatedName"}, "dummyId");
        expect(node.name).toBe("updatedName");
    });

    describe("Added", function () {
        it("Should add node to UI for given id", function () {
            spyOn(App.map, "addNodeToUI");
            var parent = App.Node("Parent");
            var tempFields = App.Node("", "right", parent, null) ? App.Node("", "right", parent) : new Object(new App.Node("", "right", parent));
            App.tracker.added("dummyID", tempFields);
            expect(App.map.addNodeToUI).toHaveBeenCalled();
        });

        it("Should not update UI element, if added node is already exists in client collection", function () {
            var newNode = {name: "dummY", left: null, right: null, position: 0};
            var fields = {name: "dummY", left: null, right: null, position: 0}
            spyOn(App.map, 'getNodeDataWithNodeId').and.callFake(function (id) {
                return newNode;
            });
            App.chart = jasmine.createSpyObj('App.chart', ['update']);
            App.tracker.added("dummyId", fields);
            expect(App.chart.update).not.toHaveBeenCalled();
        })
    });
});