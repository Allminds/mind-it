describe('helper.js tests', function() {
  describe('Direction tests', function () {
    it("should change current direction [App.DirectionToggler] ", function () {
      var directionToggler = App.DirectionToggler.getInstance();
      directionToggler.changeDirection();
      expect(directionToggler.getCurrentDirection()).toBe("right");

      directionToggler.changeDirection();
      expect(directionToggler.getCurrentDirection()).toBe("left");
    });

    it("App.calculateDirection should toggle direction for root node [App.calculateDirection]", function() {

      var root = new App.Node("root");
      root._id = "root";

      spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(root);
      var firstCallDirection = App.calculateDirection(root);
      var secondCallDirection = App.calculateDirection(root);
      expect(App.map.getDataOfNodeWithClassNamesString.calls.mostRecent().args[0]).toBe(".node.selected");
      expect(firstCallDirection).not.toBe(secondCallDirection);
    });

    it("App.calculateDirection should return the direction of the calling node for non root node [App.calculateDirection]", function() {

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

      spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(child2);
      var direction = App.calculateDirection(child2);
      expect(App.map.getDataOfNodeWithClassNamesString.calls.mostRecent().args[0]).toBe(".node.selected");
      expect(direction).toBe('left');
    });

    it("App.calculateDirection should not toggle the direction  for non root node [App.calculateDirection]", function() {

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

      spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(child2);
      var direction = App.calculateDirection(child2);
      var secondDirection = App.calculateDirection(child2);
      expect(App.map.getDataOfNodeWithClassNamesString.calls.mostRecent().args[0]).toBe(".node.selected");
      expect(direction).toBe(secondDirection);
    });

    it("App.calculateDirection should return the direction of parent node for a child node call on calculateDirection [App.calculateDirection]", function() {

      var root = {_id:"root"},
          parent = {_id:"parent", position:"right", parent:root},
          node = {_id:"node", parent:parent};
      spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
      var direction = App.calculateDirection(node.parent);
      expect(App.map.getDataOfNodeWithClassNamesString.calls.mostRecent().args[0]).toBe(".node.selected");
      expect(direction).toBe(parent.position);
    }); 
  });
  
  
  describe('App.deselectNode', function () {
    it("should deselect a previously selected node", function() {
      var fixture = '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="15680">' +
        '<g transform="translate(14400,7840)">' +
        '<g transform="translate(0,0)" class="node level-0 selected">' +
        '<ellipse rx="40" ry="21" class="root-ellipse"></ellipse>' +
        '<rect x="-25" y="-19.5" width="50" height="30"></rect>' +
        '<text cols="60" rows="4" y="9" visibility="">test</text></g>' +
        '<g transform="translate(62.515625,-15)" class="node level-1">' +
        '<rect x="-7.515625" y="-28.5" width="15.03125" height="27.5"></rect>' +
        '<text cols="60" rows="4" y="-2" visibility="">a</text>' +
        '<circle class="indicator unfilled" r="0" cx="7.515625"></circle></g>' +
        '<g transform="translate(63.296875,15)" class="node level-1">' +
        '<rect x="-8.296875" y="-28.5" width="16.59375" height="27.5"></rect>' +
        '<text cols="60" rows="4" y="-2" visibility="">b</text>' +
        '<circle class="indicator unfilled" r="0" cx="8.296875"></circle></g></g></svg>';
      setFixtures(fixture);
      App.deselectNode();
      expect(d3.selectAll(".selected")[0].length).toBe(0);
    });
  });

  describe('App.select', function() {
    it("Should select the node with class = level-0", function() {
      var fixture = '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="15680">' +
        '<g transform="translate(14400,7840)">' +
        '<g transform="translate(0,0)" class="node level-0">' +
        '<ellipse rx="40" ry="21" class="root-ellipse"></ellipse>' +
        '<rect x="-25" y="-19.5" width="50" height="30"></rect>' +
        '<text cols="60" rows="4" y="9" visibility="">test</text></g>' +
        '<g transform="translate(62.515625,-15)" class="node level-1">' +
        '<rect x="-7.515625" y="-28.5" width="15.03125" height="27.5"></rect>' +
        '<text cols="60" rows="4" y="-2" visibility="">a</text>' +
        '<circle class="indicator unfilled" r="0" cx="7.515625"></circle></g>' +
        '<g transform="translate(63.296875,15)" class="node level-1">' +
        '<rect x="-8.296875" y="-28.5" width="16.59375" height="27.5"></rect>' +
        '<text cols="60" rows="4" y="-2" visibility="">b</text>' +
        '<circle class="indicator unfilled" r="0" cx="8.296875"></circle></g></g></svg>';
      setFixtures(fixture);
      
      var node = d3.selectAll(".level-0")[0][0];
      node.__data__ = {_id : "parent",
                       position: null
                      };
      App.select(node);
      var actualNode = d3.selectAll(".selected")[0][0];
      var expectedNode = d3.selectAll(".level-0")[0][0];
      expect(actualNode).toEqual(expectedNode);
    });
  });

  it("should be able to get nodes in order of appearance in the child sub tree", function() {
    var parent = new App.Node("parent", "left", null, 0);
    parent._id = "parent";
    var child1 = new App.Node("child1", "left", parent, 0);
    child1._id = "child1";
    var child2 = new App.Node("child2", "left", parent, 1);
    child2._id = "child2";
    var child3 = new App.Node("child3", "left", parent, 1);
    child3._id = "child3";
    child1.parent = parent;
    child2.parent = parent;
    child3.parent = parent;
    parent.childSubTree = [child1, child2, child3];
    spyOn(App, "getDirection").and.returnValue("left");

    var nodes = [{__data__: child3}, {__data__: child1}, {__data__: child2}];
    var actualOrder = App.getInOrderOfAppearance(nodes).map(function(node){ return node.name; });

    expect(actualOrder[0]).toBe(child1.name);
    expect(actualOrder[1]).toBe(child2.name);
    expect(actualOrder[2]).toBe(child3.name);
  });

  it("should return false when nodes are not siblings on same side", function() {
    var parent = new App.Node("parent", null, null, 0);
    parent._id = "parent";
    var child1 = new App.Node("child1", "right", parent, 0);
    child1._id = "child1";
    var child2 = new App.Node("child2", "left", parent, 1);
    child2._id = "child2";
    var child3 = new App.Node("child3", "left", parent, 2);
    child3._id = "child3";
    child1.parent = parent;
    child2.parent = parent;
    child3.parent = parent;
    parent.left = [child2, child3];
    parent.right = [child1];

    var areSiblingsOnSameSide = App.areSiblingsOnSameSide([{__data__: child1}, {__data__: child2}, {__data__: child3}]);

    expect(areSiblingsOnSameSide).toBe(false)
  });

  it("should return true when nodes are siblings on same side", function() {
    var parent = new App.Node("parent", "left", null, 0);
    parent._id = "parent";
    var child1 = new App.Node("child1", "left", parent, 0);
    child1._id = "child1";
    var child2 = new App.Node("child2", "left", parent, 1);
    child2._id = "child2";
    var child3 = new App.Node("child3", "left", parent, 2);
    child3._id = "child3";
    child1.parent = parent;
    child2.parent = parent;
    child3.parent = parent;
    parent.left = [child1, child2, child3];

    var areSiblingsOnSameSide = App.areSiblingsOnSameSide([{__data__: child1}, {__data__: child2}, {__data__: child3}]);

    expect(areSiblingsOnSameSide).toBe(true);
  });

//
//  describe('App.checkIfSiblings',function(){
//
//
//  });

});
