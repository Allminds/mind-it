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
      var rootNode = new App.Node('root');
      rootNode._id = 'root';
      var childnode = new App.Node('child1', 'right', rootNode);
      childnode.parent = rootNode;
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

    
    it("should return root for root node on getDirection]", function() {
      var data = new App.Node('root');
      var direction = App.getDirection(data);
      expect(direction).toBe('root');
    });

    it("shoud return 'right' for immediate chidl in right subtree of root node on getDirection", function() {
      var root = new App.Node("root");
      root._id = "root";
      var right1 = new App.Node("right1", "right", root, 0);
      right1._id = "right1";
      right1.parent = root;
      root.right = [right1];
      
      var direction = App.getDirection(right1);
      expect(direction).toBe('right');
    });

    it("shoud return left for a child on left subtree of root node on getDirection", function() {
      var root = new App.Node("root");
      root._id = "root";
      var left1 = new App.Node("left1", "left", root, 0);
      left1._id = "left1";
      left1.parent = root;
      var child1 = new App.Node("child1", "left", left1, 0);
      child1._id = "child1";
      var child2 = new App.Node("child2", "left", left1, 1);
      child2._id = "child2";
      var child3 = new App.Node("child3", "left", left1, 1);
      child3._id = "child3";
      child1.parent = left1;
      child2.parent = left1;
      child3.parent = left1;
      root.left = [left1];
      left1.childSubTree = [child1, child2, child3];

      var direction = App.getDirection(child2);
      expect(direction).toBe('left');
    });

    describe("App.Node db methods", function() {
      var root, parent, child1, child2, child3;
      beforeEach(function () {
        root = new App.Node("root");
        root._id = "root";    
        parent = new App.Node("parent", "left", root, 0);
        parent._id = "parent";
        parent.parent = root;
        child1 = new App.Node("child1", "left", parent, 0);
        child1._id = "child1";
        child2 = new App.Node("child2", "left", parent, 1);
        child2._id = "child2";
        child3 = new App.Node("child3", "left", parent, 1);
        child3._id = "child3";
        child1.parent = parent;
        child2.parent = parent;
        child3.parent = parent;
        parent.childSubTree = [child1, child2, child3];
        root.left.push(parent);
      });


      it("should create new node in DB", function() {
        var newNode = new App.Node('newNode');
        spyOn(App.MindMapService.getInstance(), "addNode").and.returnValue("id");
        var node = App.Node.addToDatabase(newNode);
        expect(node._id).toBe("id");
      });

      it("should call mindMapService.updateNode with parentId for updateParentIdOfNode function call", function(){
        spyOn(mindMapService, "updateNode");
        App.Node.updateParentIdOfNode(child1, root._id);
        expect(mindMapService.updateNode).toHaveBeenCalledWith(child1._id, {parentId: root._id });
      });

      it("should call mindMapService.updateNode with childSubTree for updateChildTree function call on parent", function(){
        spyOn(mindMapService, "updateNode");
        App.Node.updateChildTree(parent);
        expect(mindMapService.updateNode).toHaveBeenCalledWith(parent._id, {childSubTree: [ 'child1','child2','child3' ]});
      });

      it("should not call mindMapService.updateNode on root if subtree name is not provided", function(){
        spyOn(mindMapService, "updateNode");
        App.Node.updateChildTree(root);
        expect(mindMapService.updateNode).not.toHaveBeenCalled();
      });

      it("should call mindMapService.updateNode on root if subtree name is provided", function(){
        spyOn(mindMapService, "updateNode");
        App.Node.updateChildTree(root, 'left');
        expect(mindMapService.updateNode).toHaveBeenCalledWith(root._id, {left: [ 'parent']});
      });

      it("should delete a node and call mindMapService.updateNode method", function() {
        spyOn(mindMapService, "updateNode");
        App.Node.delete(child1);
        expect(mindMapService.updateNode).toHaveBeenCalledWith(parent._id, { childSubTree: [ 'child2','child3' ] });
      });
    });

    describe("Repositioning Vertical", function () {
      var root, parent, child1, child2, child3;
      beforeEach(function () {
        root = new App.Node("root");
        root._id = "root";    
        parent = new App.Node("parent", "right", root, 0);
        parent._id = "parent";
        parent.parent = root;
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
        root.left.push(parent);
      });

      it("should not call swapElements method for reposition vertical key press on root node", function () {
        var root = new App.Node("root");
        spyOn(App, "swapElements");
        spyOn(mindMapService, "updateNode");
        App.Node.verticalReposition(root, App.Constants.KeyPressed.DOWN);
        expect(App.swapElements).not.toHaveBeenCalled();
        expect(mindMapService.updateNode).not.toHaveBeenCalled();
      });


      it("should call circularReposition method for mod+UP key press on first element", function () {
        spyOn(App, "circularReposition");
        spyOn(mindMapService, "updateNode");
        App.Node.verticalReposition(child1, App.Constants.KeyPressed.UP);
        expect(App.circularReposition).toHaveBeenCalled();
      });

      it("should call circularReposition method for mod+DOWN key press on last element", function () {
        spyOn(App, "circularReposition");
        spyOn(mindMapService, "updateNode");
        App.Node.verticalReposition(child3, App.Constants.KeyPressed.DOWN);
        expect(App.circularReposition).toHaveBeenCalled();
      });

      it("should call swapElements method for mod+UP key press in other cases", function () {
        spyOn(App, "swapElements");
        spyOn(mindMapService, "updateNode");
        App.Node.verticalReposition(child2, App.Constants.KeyPressed.UP);
        expect(App.swapElements.calls.mostRecent().args[1]).toBe(1);
        expect(App.swapElements.calls.mostRecent().args[2]).toBe(0);
      });

      it("should call swapElements method for mod+DOWN key press in other cases", function () {
        spyOn(App, "swapElements");
        spyOn(mindMapService, "updateNode");
        App.Node.verticalReposition(child2, App.Constants.KeyPressed.DOWN);
        expect(App.swapElements.calls.mostRecent().args[1]).toBe(1);
        expect(App.swapElements.calls.mostRecent().args[2]).toBe(2);
      });
    });
    describe("Repositioning Horizontal", function() {
      var root, left1, child1, child2, child3;
      beforeEach(function () {
        root = new App.Node("root");
        root._id = "root";
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
      });
      it("should return false reposition horizontal key press on root node", function () {
        var actualValue = App.Node.horizontalReposition(root, App.Constants.KeyPressed.LEFT);
        expect(actualValue).toBe(false);
        actualValue = App.Node.horizontalReposition(root, App.Constants.KeyPressed.RIGHT);
        expect(actualValue).toBe(false);
      });

      it("should not change the position of left child in root for mod+LEFT when child does not have any siblings", function() {
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.LEFT);
        expect(root.left[0]).toBe(left1);
      });

      it("should put the left child in root into right subtree for mod+RIGHT", function() {
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.RIGHT);
        expect(root.right[0]).toBe(left1);
      });

      it("should remove the left child in root from left subtree for mod+RIGHT", function() {
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.RIGHT);
        expect(root.left[0]).not.toBe(left1);
      });

      it("should not change the parentId of the left child in root when mod+RIGHT is pressed", function() {
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.RIGHT);
        expect(left1.parentId).toBe(root._id);
      });

      it("should put the left root child back into left subtree of root on mod+RIGHT - mod+LEFT key press", function() {
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.RIGHT);
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.LEFT);
        expect(root.left[0]).toBe(left1);
      });

      it("should put the left root child at the end of the right subtree of root on mod+RIGHT key press", function() {
        var right1 = new App.Node("right1", "right", root, 0);
        root.right = [right1];
        right1.parent = root;
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.RIGHT);
        expect(root.right[root.right.length - 1]).toBe(left1);
      });

      it("should put left1 as the last child of left2 on mod+LEFT key press", function() {
        var left2 = new App.Node("left2", "left", root, 0);
        left2._id = "left2";
        var left2Child1 = new App.Node("left2Child1", "left", left2, 0);
        left2Child1._id = "left2Child1";
        left2.childSubTree = [left2Child1];
        left2Child1.parent = left2;
        root.left.push(left2);
        left2.parent = root;
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.LEFT);
        expect(left2.childSubTree[left2.childSubTree.length - 1]).toBe(left1);
      });


      it("should put left3 as the last child of left2 on mod+LEFT key press", function() {
        var left2 = new App.Node("left2", "left", root, 0);
        left2._id = "left2";
        var left2Child1 = new App.Node("left2Child1", "left", left2, 0);
        left2Child1._id = "left2Child1";
        var left3 = new App.Node("left3", "left", root, 0);
        left3._id = "left3";
        left2.childSubTree = [left2Child1];
        left2Child1.parent = left2;
        root.left.push(left2);
        root.left.push(left3);
        left2.parent = root;
        left3.parent = root;
        App.Node.horizontalReposition(left3, App.Constants.KeyPressed.LEFT);
        expect(left2.childSubTree[left2.childSubTree.length - 1]).toBe(left3);
      });

      it("should change the parentId of left1 as left2 on mod+LEFT key press", function() {
        var left2 = new App.Node("left2", "left", root, 0);
        left2._id = "left2";
        var left2Child1 = new App.Node("left2Child1", "left", left2, 0);
        left2Child1._id = "left2Child1";
        left2.childSubTree = [left2Child1];
        left2Child1.parent = left2;
        root.left.push(left2);
        left2.parent = root;
        App.Node.horizontalReposition(left1, App.Constants.KeyPressed.LEFT);
        expect(left1.parentId).toBe(left2._id);
      });

      it("should put child3 as the last child of child2 on mod+LEFT key press", function() {
        var child2child1 = new App.Node("child2child1", "left", child2, 0);
        child2child1._id = "child2child1";
        child2child1.parent = child2;
        child2.childSubTree.push(child2child1);
        App.Node.horizontalReposition(child3, App.Constants.KeyPressed.LEFT);
        expect(child2.childSubTree[child2.childSubTree.length - 1]).toBe(child3);
      });

      it("should put child1 as the last child of child2 on mod+LEFT key press", function() {
        var child2child1 = new App.Node("child2child1", "left", child2, 0);
        child2child1._id = "child2child1";
        child2child1.parent = child2;
        child2.childSubTree.push(child2child1);
        App.Node.horizontalReposition(child1, App.Constants.KeyPressed.LEFT);
        expect(child2.childSubTree[child2.childSubTree.length - 1]).toBe(child1);
      });

      it("should put child2 as the second child in left subtree of root on mod+RIGHT key press on child2", function() {
        var left2 = new App.Node("left2", "left", root, 0);
        left2._id = "left2";
        root.left.push(left2);
        left2.parent = root;
        App.Node.horizontalReposition(child2, App.Constants.KeyPressed.RIGHT);
        expect(root.left[1]).toBe(child2);
      });

      it("should put child2child1 as the third child of left1 on mod+RIGHT key press on child2child1", function() {
        var child2child1 = new App.Node("child2child1", "left", child2, 0);
        child2child1._id = "child2child1";
        child2child1.parent = child2;
        child2.childSubTree.push(child2child1);
        App.Node.horizontalReposition(child2child1, App.Constants.KeyPressed.RIGHT);
        expect(left1.childSubTree[2]).toBe(child2child1);
      });
      
      it("should call updateChildTree twice, followed by updateParentIdofNode", function(){
        spyOn(App.Node, "updateChildTree");
        spyOn(App.Node, "updateParentIdOfNode");

        var child2child1 = new App.Node("child2child1", "left", child2, 0);
        child2child1._id = "child2child1";
        child2child1.parent = child2;
        child2.childSubTree.push(child2child1);
        App.Node.horizontalReposition(child2child1, App.Constants.KeyPressed.RIGHT);
        expect(App.Node.updateChildTree.calls.count()).toBe(2);
        child2child1.parentId = root._id;
        expect(App.Node.updateParentIdOfNode).toHaveBeenCalledWith(child2child1);

        
      });
      
      
    });
  });
});
