/* global spyOn */
/* global describe */
/* global beforeEach */
/* global it */
/* global expect */
/* globals Player: false, Song: false */

describe('MindMapService', function () {
  var mindMapService;

  beforeEach(function () {
    mindMapService = App.MindMapService.getInstance();
  });

  describe("addChild", function () {
    //it('Should add a node to an existing node', function () {
    //  var name = "new mindmap", dir = "right",
    //    parent_node = {name: name, children: [], direction: dir},
    //    new_node = {name: name, children: [], direction: dir};
    //  mindMapService.addChild(parent_node);
    //  parent_node.children[0] = new_node;
    //  expect(parent_node.children.length).toBe(1);
    //
    //});
  });

  describe("build tree", function () {
    var root, leftNode1, rightNode1, leftNode2, rightNode2;
    beforeEach(function () {
      root = new App.Node("root", "root", null, 0);
      root._id = "root";
      leftNode1 = new App.Node("left node 1", "left", root, 0);
      leftNode1._id = "leftnode1";
      rightNode1 = new App.Node("right node 1", "right", root, 0);
      rightNode1._id = "rightnode1";
      leftNode2 = new App.Node("left node 2", "left", leftNode1, 0);
      leftNode2._id = "leftnode2";
      rightNode2 = new App.Node("right node 2", "right", rightNode1, 0);
      rightNode2._id = "rightnode2";

      root.left.push(leftNode1._id);
      root.right.push(rightNode1._id);
      leftNode1.childSubTree.push(leftNode2._id);
      rightNode1.childSubTree.push(rightNode2._id);
    });

    it("should build tree", function () {
      var root1 = mindMapService.buildTree(root._id, [root, leftNode1, leftNode2, rightNode2, rightNode1]);
      expect(root1.left[0]._id).toBe(leftNode1._id);
      expect(root1.left[0].childSubTree[0]._id).toBe(leftNode2._id);
      expect(root1.right[0]._id).toBe(rightNode1._id);
      expect(root1.right[0].childSubTree[0]._id).toBe(rightNode2._id);
    })
  });

});

 