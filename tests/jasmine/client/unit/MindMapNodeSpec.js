//describe('AppNodeObject.js', function () {
//
//  describe('AppNodeObject.js constructor', function () {
//    it("should be able to access application AppNodeObject object globally", function () {
//      expect(App.Node).not.toBeNull();
//    });
//
//    it("isRoot should return true for document root", function() {
//      var rootNode = new App.Node('root', 'root');
//      expect(rootNode.isRoot()).toBe(true);
//    });
//
//    it("isRoot should return false  for child node", function() {
//      var rootNode = new App.Node('root', 'root');
//      var childnode = new App.Node('child1');
//      expect(childnode.isRoot()).toBe(false);
//    });
//
//    it("parentId of a child should be updated for a child", function() {
//      var rootNode = new App.Node('root', 'root');
//      rootNode._id = 'rootId';
//      var childnode = new App.Node('child1', 'left', rootNode, 0);
//      expect(childnode.parentId).toBe(rootNode._id);
//    });
//
//    it("parentId of a child should be updated for a non root child", function() {
//      var rootNode = new App.Node('root', 'root');
//      rootNode._id = 'rootId';
//      var childnode = new App.Node('child1', 'left', rootNode, 0);
//      childnode._id = 'child1';
//      var leafnode = new App.Node('child2', 'left', childnode, 0);
//
//      expect(leafnode.parentId).toBe(childnode._id);
//    });
//
//    it("rootId of a child should be updated for a child", function() {
//      var rootNode = new App.Node('root', 'root');
//      rootNode._id = 'rootId';
//      var childnode = new App.Node('child1', 'left', rootNode, 0);
//      expect(childnode.rootId).toBe(rootNode._id);
//    });
//
//    it("rootId of a child should be updated for a non root child", function() {
//      var rootNode = new App.Node('root', 'root');
//      rootNode._id = 'rootId';
//      var childnode = new App.Node('child1', 'left', rootNode, 0);
//      childnode._id = 'child1';
//      var leafnode = new App.Node('child2', 'left', childnode, 0);
//      expect(leafnode.rootId).toBe(rootNode._id);
//    });
//  });
//
//
//  describe('App.Node.js DB', function() {
//    var mindmapService = null;
//    beforeEach(function () {
//      mindmapService = App.MindMapService.getInstance();
//    });
//
//    it("should create new node in DB", function() {
//      var newNode = new App.Node('newNode', 'root');
//      spyOn(mindmapService, "addNode").and.returnValue("id");
//      var id = newNode.addToDatabase(mindmapService);
//      expect(id).toBe("id");
//    });
//
//    //it("should call mindMapService.updateNode on addChild method call", function() {
//    //  var parentNode = new App.Node('newNode', 'root');
//    //  var childnode = new App.Node('child1', 'left', null, 0);
//    //  spyOn(mindmapService, "addNode").and.returnValue("id");
//    //  spyOn(mindmapService, 'updateNode');
//    //  parentNode.addChild(childnode, mindmapService);
//    //  expect(mindmapService.updateNode).toHaveBeenCalled();
//    //});
//
//  });
//});