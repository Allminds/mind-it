fdescribe('Tracker.js', function () {
    it("should have called Meteor method to update map count", function () {
        spyOn(Meteor, "call");
        App.setMapsCount();
        expect(Meteor.call).toHaveBeenCalled();
    });
    it("Should add node to UI for given id", function(){
        spyOn(App.map,"addNodeToUI");
        var parent = App.Node("Parent");
        var tempFields = App.Node("", "right", parent, null) ? App.Node("", "right", parent) : new Object(new App.Node("", "right", parent));
        App.tracker.added("dummyID", tempFields);
        expect(App.map.addNodeToUI).toHaveBeenCalled();
    });
    it("Should add node to the subtree of given parent", function(){
        var parent = {name:"Parent", childSubTree: []};
        parent.isCollapsed = true;
        spyOn(App.map,"getNodeDataWithNodeId").and.callFake(function(){return parent;});
        App.tracker.updateSubtree("parentId", {childSubTree:["dummy id"]}, "childSubTree");
        expect(parent.childSubTree.length).toBe(1);
    });

    it("Should update name of given node", function(){
        var node = {name:"dummY"};
        App.tracker.updateNameOfNode(node, {name: "updatedName"},"dummyId");
        expect(node.name).toBe("updatedName");
    });


});