describe("Create BulletedList from Node", function () {
    var root, left1, left2, child1, child2, child3;
    beforeEach(function () {
        root = new App.Node("root");
        root._id = "root";

        left1 = new App.Node("left1", "left", root, 0);
        left1._id = "left1";
        left1.parent = root;

        left2 = new App.Node("left2", "left", root, 0);
        left2._id = "left2";
        left2.parent = root;

        child1 = new App.Node("child1", "left", left1, 0);
        child1._id = "child1";
        child1.parent = left1;

        child2 = new App.Node("child2", "left", left1, 1);
        child2._id = "child2";
        child2.parent = left1;

        child3 = new App.Node("child3", "left", left1, 1);
        child3._id = "child3";
        child3.parent = left1;

        root.left = [left1, left2];

        left1.childSubTree = [child1, child2, child3];
    });

    it("Should return empty string for noObjects", function () {
        var returnString = App.CopyParser.populateBulletedFromObject();
        expect(returnString).toEqual("");
    });

    it("Should return 'child1' when passing the node child1", function () {
        var returnString = App.CopyParser.populateBulletedFromObject(child1);
        expect(returnString).toEqual('child1');
    });

    it("Should return proper bulleted list when passing the node left1", function () {
        var returnString = App.CopyParser.populateBulletedFromObject(left1);
        expect(returnString).toEqual('left1\n\tchild1\n\tchild2\n\tchild3');
    });

    it("Should return proper bulleted list when passing the root node", function () {
        var returnString = App.CopyParser.populateBulletedFromObject(root);
        expect(returnString).toEqual('root\n\tleft1\n\t\tchild1\n\t\tchild2\n\t\tchild3\n\tleft2');
    });
});

describe("Create Node from Bulleted list", function () {
    var root, parent;
    var mindmapService;

    beforeEach(function () {
        root = new App.Node("root");
        root._id = "root";

        parent = new App.Node("parent", "left", root, 0);
        parent._id = "parent";

        mindmapService = App.MindMapService.getInstance();

        spyOn(mindmapService, "addNode").and.callFake(function (node) {
            return node.name;
        });

        spyOn(mindmapService, "updateNode");
    });

    it("Should return no Object for empty BulletedList", function () {
        var bulletedList = "";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(parent.childSubTree.length).toEqual(0);

    });


    it("Should append child id to parent, call addNode and updateNode for child and parent respectively", function () {

        var bulletedList = "child1";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(mindmapService.addNode.calls.mostRecent().args[0].parentId).toEqual(parent._id);
        expect(mindmapService.updateNode.calls.mostRecent().args[1].childSubTree[0]).toEqual("child1");

    });

    it("Should append to the child of parent", function () {
        var bulletedList = "child1\nchild2";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(mindmapService.addNode.calls.mostRecent().args[0].parentId).toEqual(parent._id);
        expect(mindmapService.updateNode.calls.mostRecent().args[1].childSubTree[1]).toEqual("child2");
    });

    it("Should properly parse for level 2 children", function () {
        var bulletedList = "child1\nchild2\n\tchild2.1\n\tchild2.2\nchild3";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(mindmapService.addNode.calls.mostRecent().args[0].parentId).toEqual("child2");
        expect(mindmapService.updateNode.calls.mostRecent().args[1].childSubTree[1]).toEqual("child2.2");
        expect(mindmapService.updateNode.calls.argsFor(0)[1].childSubTree).toEqual(["child1", "child2", "child3"]);
    });

    it("Should properly parse for level 2 children for two level 1 nodes with children", function () {
        var bulletedList = "child1\nchild2\n\tchild2.1\n\tchild2.2\nchild3\n\tchild3.1\n\tchild3.2\nchild4";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(mindmapService.addNode.calls.mostRecent().args[0].parentId).toEqual("child3");
        expect(mindmapService.updateNode.calls.mostRecent().args[1].childSubTree[1]).toEqual("child3.2");
        expect(mindmapService.updateNode.calls.argsFor(1)[1].childSubTree).toEqual(["child2.1", "child2.2"]);
    });

    it("Should properly parse for level 3 children", function () {
        var bulletedList = "child1\nchild2\n\tchild2.1\n\tchild2.2\nchild3\n\tchild3.1\n\t\tchild3.1.1\n\tchild3.2\nchild4";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(mindmapService.addNode.calls.mostRecent().args[0].parentId).toEqual("child3.1");
        expect(mindmapService.updateNode.calls.mostRecent().args[1].childSubTree[0]).toEqual("child3.1.1");
        expect(mindmapService.updateNode.calls.argsFor(1)[1].childSubTree).toEqual(["child2.1", "child2.2"]);
        expect(mindmapService.updateNode.calls.argsFor(2)[1].childSubTree).toEqual(["child3.1", "child3.2"]);
    });

    it("Should properly parse for children with multiple tabs", function () {
        var bulletedList = "child1\nchild2\n\t\t\t\tchild2.1\n\tchild2.2\nchild3\n\t\t\t\tchild3.1\n\t\t\t\t\tchild3.1.1\n\tchild3.2\nchild4";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(mindmapService.addNode.calls.mostRecent().args[0].parentId).toEqual("child3.1");
        expect(mindmapService.updateNode.calls.mostRecent().args[1].childSubTree[0]).toEqual("child3.1.1");
        expect(mindmapService.updateNode.calls.argsFor(1)[1].childSubTree).toEqual(["child2.1", "child2.2"]);
        expect(mindmapService.updateNode.calls.argsFor(2)[1].childSubTree).toEqual(["child3.1", "child3.2"]);
    });

    it("Should properly parse for children with multiple tabs with carriage return", function () {
        var bulletedList = "child1\n\rchild2\n\r\t\t\t\tchild2.1\n\r\tchild2.2\n\rchild3\n\r\t\t\t\tchild3.1\n\r\t\t\t\t\tchild3.1.1\n\r\tchild3.2\n\rchild4";
        App.CopyParser.populateObjectFromBulletedList(bulletedList, parent);
        expect(mindmapService.addNode.calls.mostRecent().args[0].parentId).toEqual("child3.1");
        expect(mindmapService.updateNode.calls.mostRecent().args[1].childSubTree[0]).toEqual("child3.1.1");
        expect(mindmapService.updateNode.calls.argsFor(1)[1].childSubTree).toEqual(["child2.1", "child2.2"]);
        expect(mindmapService.updateNode.calls.argsFor(2)[1].childSubTree).toEqual(["child3.1", "child3.2"]);
    });


});