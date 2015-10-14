/* global spyOn */
/* global describe */
/* global beforeEach */
/* global it */
/* global expect */
/* globals Player: false, Song: false */

describe('MindMapService', function () {
  var mindMapService;

  beforeEach(function () {
    mindMapService = new MindMapService();
  });

  describe("createRootNode", function () {
    it('should return id after inserting node in DB', function () {

      var mindmapId = 1, name = 'string'
        , result = { name: name, left : [], right: [] };
      spyOn(Mindmaps, 'insert').and.returnValue(mindmapId);

      expect(mindMapService.createRootNode(name)).toBe(mindmapId);
      expect(Mindmaps.insert.calls.argsFor(0)).toEqual([result]);
    });
  });

  describe("updateNode", function () {
    it('state of the object should remain same after DB update', function () {
      var node = { _id: 1, left: [],right: [], name: 'someNode' };
      spyOn(Mindmaps, 'update');
      mindMapService.updateNode(node);
      expect(Mindmaps.update.calls.argsFor(0)).toEqual([{_id: 1},{$set: {name:"someNode"}}]);
    });
  });

  describe("addRightChild", function(){
    it('Should add a right node to an existing node', function(){
      var name= "new mindmap",
      parent_node={name:name,left:[],right:[]},
      new_node= {name:name,left:[],right:[], parent:""};
      mindMapService.addRightChild(parent_node);
      parent_node.right[0]=new_node;
      expect(parent_node.right.length).toBe(1);

    });
  });

  describe("addLeftChild", function(){
    it('Should add a left node to an existing node', function(){
      var name= "new mindmap",
      parent_node={name:name,left:[],right:[]},
      new_node= {name:name,left:[],right:[], parent:""};
      mindMapService.addLeftChild(parent_node);
      parent_node.left[0]=new_node;
      expect(parent_node.left.length).toBe(1);

    });
  });
});

 