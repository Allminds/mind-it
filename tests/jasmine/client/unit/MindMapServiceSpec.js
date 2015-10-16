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
        , result = { name: name, children : [], direction : null };
      spyOn(Mindmaps, 'insert').and.returnValue(mindmapId);

      expect(mindMapService.createRootNode(name)).toBe(mindmapId);
      expect(Mindmaps.insert.calls.argsFor(0)).toEqual([result]);
    });
  });

   describe("updateNode", function () {
    it('state of the object should remain same after DB update', function () {
      var node = { _id: 1, children: [],direction: "right", name: 'someNode' },
        key = { _id: node._id },
        updatedMap = { children: [],direction:"right", name: 'someNode' };
      spyOn(Mindmaps, 'update');
      mindMapService.updateNode(node);
      expect(Mindmaps.update.calls.argsFor(0)).toEqual([key, updatedMap]);
    });
  });

  describe("addChild", function(){
    it('Should add a node to an existing node', function(){
      var name = "new mindmap", dir = "right"
      parent_node = {name:name,children:[],direction:dir},
      new_node = {name:name,children:[],direction:dir};
      mindMapService.addChild(parent_node);
      parent_node.children[0] = new_node;
      expect(parent_node.children.length).toBe(1);

    });
  });

});

 