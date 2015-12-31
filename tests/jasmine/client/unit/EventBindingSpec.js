describe('create.helpers.eventBinding.js', function () {
  describe('focusAfterDelete', function () {
    it("should select next node of deleted node if it exists", function () {
      var next = {_id: "next"},
        previous = {_id: "previous"},
        parent = {_id: "parent", children: [previous,next]},
        removedNode = {_id: "removed", parent:parent, next: next, previous: previous};
      spyOn(App, 'selectNode');
      App.eventBinding.focusAfterDelete(removedNode, 1);
      expect(App.selectNode).toHaveBeenCalledWith(next);
    });
    it("should select previous node of deleted node if it exists and next node does not exist", function () {
      var previous = {_id: "previous"},
        parent = {_id: "parent", children: [previous]},
        removedNode = {_id: "removed", parent:parent, previous: previous};
      spyOn(App, 'selectNode');
      App.eventBinding.focusAfterDelete(removedNode, 1);
      expect(App.selectNode).toHaveBeenCalledWith(previous);
    });
    it("should select parent node of deleted node if it exists after and next & previous nodes do not exist", function () {
      var parent = {_id: "parent", children: []},
        removedNode = {_id: "removed", parent:parent};
      spyOn(App, 'selectNode');
      App.eventBinding.focusAfterDelete(removedNode, 1);
      expect(App.selectNode).toHaveBeenCalledWith(parent);
    });
  });

  describe('App.cutNode', function () {
    it("should show alert if I try to cut root node", function() {
      spyOn(App.map, "getDataOfNodeWithClassNamesString");
      spyOn(window, "alert");
      App.cutNode();
      expect(window.alert).toHaveBeenCalled();
    });
    it("should call all internal methods on cutNode call for node other than root", function () {
      var parent = {_id:"parent"},
        node = {_id:"node", position:"right", parent:parent};
      spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
      spyOn(App.map ,"storeSourceNode");
      spyOn(Meteor, "call");

      App.cutNode();

      expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".selected");
      expect(App.map.storeSourceNode).toHaveBeenCalledWith(node);
      expect(Meteor.call.calls.mostRecent().args[0]).toBe("deleteNode");
    });
  });

  describe('App.eventBinding.findSameLevelChild', function () {
    it("should return passed node as sameLevelChild if it does not have children", function () {
      var node = {};
      expect(App.eventBinding.findSameLevelChild(node, 2, 0)).toBe(node);
    });
    it("should return passed node as sameLevelChild if it has same depth", function () {
      var node = {depth: 2, children:[]};
      expect(App.eventBinding.findSameLevelChild(node, 2, 0)).toBe(node);
    });
  });

  describe('App.eventBinding.performLogicalVerticalMovement', function () {
    it("should select downward node on performing vertical movement for down key press action", function () {
      var first = {_id:"first", depth:1, position:"right"},
        second = {_id:"second", depth:1, position:"right"},
        parent = {_id:"parent", children:[first,second]};
      first.parent = parent;

      spyOn(App, "selectNode");
      App.eventBinding.performLogicalVerticalMovement(first, 1);

      expect(App.selectNode).toHaveBeenCalledWith(second);
    });
    it("should select upward node on performing vertical movement for up key press action", function () {
      var first = {_id:"first", depth:1, position:"right"},
        second = {_id:"second", depth:1, position:"right"},
        parent = {_id:"parent", children:[first,second]};
      second.parent = parent;

      spyOn(App, "selectNode");
      App.eventBinding.performLogicalVerticalMovement(second, 0);

      expect(App.selectNode).toHaveBeenCalledWith(first);
    });
  });
});