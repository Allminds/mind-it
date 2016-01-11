describe('lib.Node.js', function () {

  describe('Node constructor', function () {
    it("should be able to access application Node object globally", function () {
      expect(App.Node).not.toBeNull();
    });

    it("isRoot should return true for root node", function() {
      var rootNode = new App.Node('root');
      expect(App.Node.isRoot(rootNode)).toBe(true);
    });

    it("isRoot should return false for any child node", function() {
      var childnode = new App.Node('child1', 'right');
      expect(App.Node.isRoot(childnode)).toBe(false);
    });

    it("parentId should be root node id for level-1 child", function() {
      var rootNode = new App.Node('root');
      rootNode._id = 'rootId';
      var childnode = new App.Node('child1', 'left', rootNode, 0);
      expect(childnode.parentId).toBe(rootNode._id);
    });

    it("parentId should be level-1 node for a level-2 child", function() {
      var rootNode = new App.Node('root');
      rootNode._id = 'rootId';
      var childnode = new App.Node('child1', 'left', rootNode, 0);
      childnode._id = 'child1';
      var leafnode = new App.Node('child2', 'left', childnode, 0);

      expect(leafnode.parentId).toBe(childnode._id);
    });

    it("rootId of a child should be updated for every child", function() {
      var rootNode = new App.Node('root');
      rootNode._id = 'rootId';
      var childnode = new App.Node('child1', 'left', rootNode, 0);
      expect(childnode.rootId).toBe(rootNode._id);
      childnode._id = 'child1';
      var leafnode = new App.Node('child2', 'left', childnode, 0);
      expect(leafnode.rootId).toBe(rootNode._id);
    });
  });


  describe('App.Node.js methods', function() {
    var mindMapService;
    beforeEach(function () {
      mindMapService = App.MindMapService.getInstance();
    });

    it("should create new node in DB", function() {
      var newNode = new App.Node('newNode');
      spyOn(App.MindMapService.getInstance(), "addNode").and.returnValue("id");
      var node = App.Node.addToDatabase(newNode);
      expect(node._id).toBe("id");
    });

    it("should delete a node and call mindMapService.updateNode method", function() {
      var parent = new App.Node("parent", "right", null, 0);
      parent._id = "parent";
      var child1 = new App.Node("child1", "right", parent, 0);
      child1._id = "child1";
      var child2 = new App.Node("child2", "right", parent, 1);
      child2._id = "child2";
      child1.parent = parent;
      child2.parent = parent;
      parent.childSubTree = [child1, child2];

      spyOn(mindMapService, "updateNode");
      App.Node.delete(child1);
      expect(mindMapService.updateNode).toHaveBeenCalledWith(parent._id, { childSubTree: [ 'child2' ] });
    });

    describe("Repositioning", function () {
      var parent, child1, child2, child3;
      beforeEach(function () {
        parent = new App.Node("parent", "right", null, 0);
        parent._id = "parent";
        child1 = new App.Node("child1", "right", parent, 0);
        child1._id = "child1";
        child2 = new App.Node("child2", "right", parent, 1);
        child2._id = "child2";
        child3 = new App.Node("child3", "right", parent, 1);
        child2._id = "child3";
        child1.parent = parent;
        child2.parent = parent;
        child3.parent = parent;
        parent.childSubTree = [child1, child2, child3];
      });

      it("should call circularReposition method for mod+UP key press on first element", function () {
        spyOn(App, "circularReposition");
        spyOn(mindMapService, "updateNode");
        App.Node.reposition(child1, App.Constants.KeyPressed.UP);
        expect(App.circularReposition).toHaveBeenCalled();
      });

      it("should call circularReposition method for mod+DOWN key press on last element", function () {
        spyOn(App, "circularReposition");
        spyOn(mindMapService, "updateNode");
        App.Node.reposition(child3, App.Constants.KeyPressed.DOWN);
        expect(App.circularReposition).toHaveBeenCalled();
      });

      it("should call swapElements method for mod+UP key press in other cases", function () {
        spyOn(App, "swapElements");
        spyOn(mindMapService, "updateNode");
        App.Node.reposition(child2, App.Constants.KeyPressed.UP);
        expect(App.swapElements.calls.mostRecent().args[1]).toBe(1);
        expect(App.swapElements.calls.mostRecent().args[2]).toBe(0);
      });

      it("should call swapElements method for mod+DOWN key press in other cases", function () {
        spyOn(App, "swapElements");
        spyOn(mindMapService, "updateNode");
        App.Node.reposition(child2, App.Constants.KeyPressed.DOWN);
        expect(App.swapElements.calls.mostRecent().args[1]).toBe(1);
        expect(App.swapElements.calls.mostRecent().args[2]).toBe(2);
      });
    });

  });
});