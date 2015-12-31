describe('helper.js tests', function() {
  describe('Direction tests', function () {
    it("should change current direction [App.DirectionToggler] ", function () {
      var directionToggler = App.DirectionToggler.getInstance();
      directionToggler.changeDirection();
      expect(directionToggler.getCurrentDirection()).toBe("left");

      directionToggler.changeDirection();
      expect(directionToggler.getCurrentDirection()).toBe("right");
    });

    it("should return root for null data [App.getDirection]", function() {
      var data = null;
      var direction = App.getDirection(data);
      expect(direction).toBe('root');
    });

    it("shoud return 'right' for a non root node on the right of root node [App.getDirection]", function() {
      var data = {position:'right'};
      var direction = App.getDirection(data);
      expect(direction).toBe('right');
    });

    it("shoud return parent's position for a child of a non root node [App.getDirection]", function() {
      var data = {parent: {
        position:'left'
      }
                 };
      var direction = App.getDirection(data);
      expect(direction).toBe(data.parent.position);
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
      expect(node).toEqual(expectedNode); 
    });
  });

  
  
});
