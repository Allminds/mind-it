describe('eventBinding.js', function () {

  describe('App.eventBinding scoped functions', function () {
    describe('App.eventBinding.focusAfterDelete', function () {
      it("should select next node of deleted node if it exists", function () {
        var next = {_id: "next"},
          previous = {_id: "previous"},
          parent = {_id: "parent", children: [previous, next]},
          removedNode = {_id: "removed", parent: parent, next: next, previous: previous};
        spyOn(App, 'selectNode');

        App.eventBinding.focusAfterDelete(removedNode, 1);

        expect(App.selectNode).toHaveBeenCalled();
      });

      it("should select previous node of deleted node if it exists and next node does not exist", function () {
        var previous = {_id: "previous"},
            parent = {_id: "parent", children: [previous]},
          removedNode = {_id: "removed", parent: parent, previous: previous};
        spyOn(App, 'selectNode');

        App.eventBinding.focusAfterDelete(removedNode, 1);

        expect(App.selectNode).toHaveBeenCalled();
      });

      it("should select parent node of deleted node if it exists after and next & previous nodes do not exist", function () {
        var parent = {_id: "parent", children: []},
          removedNode = {_id: "removed", parent: parent};
        spyOn(App, 'selectNode');

        App.eventBinding.focusAfterDelete(removedNode, 1);

        expect(App.selectNode).toHaveBeenCalledWith(parent);
      });
    });
    describe('App.eventBinding.findSameLevelChild', function () {
      it("should return passed node as sameLevelChild if it does not have children", function () {
        var node = {};
        expect(App.eventBinding.findSameLevelChild(node, 2, 0)).toBe(node);
      });
      it("should return passed node as sameLevelChild if it has same depth", function () {
        var node = {depth: 2, children: []};
        expect(App.eventBinding.findSameLevelChild(node, 2, 0)).toBe(node);
      });
    });
    describe('App.eventBinding.performLogicalVerticalMovement', function () {
      // it("should select downward node on performing vertical movement for down key press action", function () {
      //   var first = {_id: "first", depth: 1, position: "right"},
      //     second = {_id: "second", depth: 1, position: "right"},
      //     parent = {_id: "parent", childSubTree: [first, second]};
      //   first.parent = parent;

      //   spyOn(App, "selectNode");
      //   App.eventBinding.performLogicalVerticalMovement(first, App.Constants.KeyPressed.DOWN);

      //   expect(App.selectNode).toHaveBeenCalledWith(second);
      // });
      // it("should select upward node on performing vertical movement for up key press action", function () {
      //   var first = {_id: "first", depth: 1, position: "right"},
      //     second = {_id: "second", depth: 1, position: "right"},
      //     parent = {_id: "parent", children: [first, second]};
      //   second.parent = parent;

      //   spyOn(App, "selectNode");
      //   App.eventBinding.performLogicalVerticalMovement(second, App.Constants.KeyPressed.UP);

      //   expect(App.selectNode).toHaveBeenCalledWith(first);
      // });
    });
    describe('event binding helpers', function(){
      var first, second, parent;
      beforeEach(function () {
        first = {_id: "first", depth: 1, position: "right", __data__: "testData"};
        second = {_id: "second", depth: 1, position: "right", __data__: null};
        parent = {_id: "parent", children: [first, second]};
        second.parent = parent;
      });

      it('should call beforeBindEventAction and case action in bindEventAction', function () {
        spyOn(App.eventBinding, 'beforeBindEventAction').and.returnValue(first.__data__);
        spyOn(App.eventBinding, 'caseAction');
        App.eventBinding.bindEventAction();
        expect(App.eventBinding.beforeBindEventAction).toHaveBeenCalled();
        expect(App.eventBinding.caseAction).toHaveBeenCalled();
      });

      it('should call beforeBindEventAction and should not call case action in bindEventAction', function () {
        spyOn(App.eventBinding, 'beforeBindEventAction').and.returnValue(second.__data__);
        spyOn(App.eventBinding, 'caseAction');
        App.eventBinding.bindEventAction();
        expect(App.eventBinding.beforeBindEventAction).toHaveBeenCalled();
        expect(App.eventBinding.caseAction).not.toHaveBeenCalled();
      });

      it('should call selectNode and setPrevDepth in afterBindEventAction', function(){
        spyOn(App, 'selectNode');
        spyOn(App.nodeSelector, 'setPrevDepth');
        App.eventBinding.afterBindEventAction(first);
        expect(App.selectNode).toHaveBeenCalledWith(first);
        expect(App.nodeSelector.setPrevDepth).toHaveBeenCalledWith(first.depth);
      });

    });
  });

   describe('App.cutNode', function () {

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


     it("should show alert if I try to cut root node", function () {
       spyOn(window, "alert");
       App.cutNode(root);
       expect(window.alert).toHaveBeenCalled();
     });

     //it("should delete node if I click yes on confirm dialog", function() {
     //  App.chart = jasmine.createSpyObj('App.chart', [ 'update' ]);
     //
     //  App.chart.update.and.callFake(function() {
     //    //throw 'an-exception';
     //  });
     //
     //  spyOn(window, "confirm").and.returnValue(true);
     //  spyOn(App.eventBinding,'focusAfterDelete');
     //
     //  App.cutNode(parent);
     //  expect(root.left[0]).not.toBe(parent);
     //
     //
     //});

  //   it("should call all internal methods on cutNode call for node other than root", function () {
  //     var parent = {_id: "parent"},
  //       node = {_id: "node", position: "right", parent: parent};
  //     spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
  //     spyOn(App.map, "storeSourceNode");
  //     spyOn(Meteor, "call");

  //     App.cutNode();

  //     expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".selected");
  //     expect(App.map.storeSourceNode).toHaveBeenCalledWith(node);
  //     expect(Meteor.call.calls.mostRecent().args[0]).toBe("deleteNode");
  //   });
  });

  describe("Node Add/Delete/Edit/Collapse events", function () {
    var event, node, newNode, parent;
    beforeEach(function () {
      var fixture = '<div id="mindmap"> ' +
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="9300"> ' +
        '<g transform="translate(14400,4650)"><g transform="translate(0,0)" class="node level-0 selected">' +
        '<ellipse rx="125.859375" ry="28.834375" class="root-ellipse"></ellipse>' +
        '<rect x="-95.859375" y="-18.5" width="191.71875" height="29.5"></rect>' +
        '<text cols="60" rows="4" y="9">' +
        '<tspan x="0" dy="0">New Mindmap</tspan>' +
        '</text></g></g></svg> ' +
        '</div>';
      setFixtures(fixture);

      event = document.createEvent("Events");
      event.initEvent("keydown", true, true);

      node = {_id: "node", position: "right"};
      parent = {_id: "parent", position: "right", children: [node]};
      newNode = {_id: "newNode"};
      node.parent = parent;
    });

    describe("New Node creation", function () {
      it("should add new sibling on enter keypress", function () {
        event.keyCode = 13;
        spyOn(App.eventBinding, "newNodeAddAction");

        document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

        expect(App.eventBinding.newNodeAddAction).toHaveBeenCalled();
      });

      it("should call all the functions in enterAction function flow", function () {
        spyOn(App, "calculateDirection").and.returnValue(parent.position);
        spyOn(App.map, "addNewNode").and.returnValue(newNode);

        App.eventBinding.enterAction(node);

        expect(App.calculateDirection).toHaveBeenCalled();
        expect(App.map.addNewNode).toHaveBeenCalled();
      });

      it("should call all the functions in afterNewNodeAddition function flow ", function () {
        spyOn(App, "deselectNode");
        spyOn(App.map, "makeEditable");
        spyOn(App.eventBinding, "escapeOnNewNode");

        App.eventBinding.afterNewNodeAddition(newNode, node);

        expect(App.deselectNode).toHaveBeenCalled();
        expect(App.map.makeEditable).toHaveBeenCalled();
        expect(App.eventBinding.escapeOnNewNode).toHaveBeenCalled();
      });

      it("should add new child on tab keypress", function () {
        event.keyCode = 9;

        spyOn(App.eventBinding, "newNodeAddAction");
        document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

        expect(App.eventBinding.newNodeAddAction).toHaveBeenCalled();
      });

      it("should call all the functions in tabAction function flow", function () {
        spyOn(App, "calculateDirection").and.returnValue(node.position);
        spyOn(App.map, "addNewNode").and.returnValue(newNode);

        App.eventBinding.tabAction(node);

        expect(App.calculateDirection).toHaveBeenCalled();
        expect(App.map.addNewNode).toHaveBeenCalled();
      });

      //it("should call all the functions in newNodeAddAction function flow for enter action", function () {
      //  spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
      //  spyOn(App.eventBinding, "enterAction").and.returnValue(newNode);
      //  spyOn(App.eventBinding, "afterNewNodeAddition");
      //
      //  App.eventBinding.newNodeAddAction(App.eventBinding.enterAction);
      //
      //  expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".node.selected");
      //  expect(App.eventBinding.enterAction).toHaveBeenCalled();
      //  expect(App.eventBinding.afterNewNodeAddition).toHaveBeenCalledWith(newNode, node);
      //});

      //it("should call all the functions in newNodeAddAction function flow for tab action", function () {
      //  spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
      //  spyOn(App.eventBinding, "tabAction").and.returnValue(newNode);
      //  spyOn(App.eventBinding, "afterNewNodeAddition");
      //
      //  App.eventBinding.newNodeAddAction(App.eventBinding.tabAction);
      //
      //  expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".node.selected");
      //  expect(App.eventBinding.tabAction).toHaveBeenCalled();
      //  expect(App.eventBinding.afterNewNodeAddition).toHaveBeenCalledWith(newNode, node);
      //});
    });

    xdescribe("Node deletion", function () {
      beforeEach(function () {
        spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
      });
      it("should call all the functions in delete keypress", function () {
        event.keyCode = 46;
        spyOn(Meteor, "call");
        spyOn(App, "getDirection").and.returnValue(node.position);
        spyOn(App.eventBinding, "focusAfterDelete");
        spyOn(App.Node, "delete");

        document.getElementsByClassName("node")[0].dispatchEvent(event);

        expect(App.Node.delete).toHaveBeenCalled();
        expect(App.eventBinding.focusAfterDelete).toHaveBeenCalled();
      });

      it("should display alert when delete key is pressed on root node", function () {
        event.keyCode = 46;
        spyOn(window, "alert");
        spyOn(App, "getDirection").and.returnValue("root");

        document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

        expect(window.alert).toHaveBeenCalled();
      });

      afterEach(function () {
        expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".node.selected");
        expect(App.getDirection).toHaveBeenCalledWith(node);
      });
    });

    xdescribe("node editing on f2", function() {
      it("should show text box on fw if some node is selected", function() {
        event.keyCode = 113;
        spyOn(App, "showEditor");
        document.getElementsByClassName("node")[0].dispatchEvent(event);

        expect(App.showEditor).toHaveBeenCalled();
      });

      it("should do nothing on f2 if no node is selected", function () {
        var fixture = '<div id="mindmap"> ' +
          '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="9300"> ' +
          '<g transform="translate(14400,4650)"><g transform="translate(0,0)" class="node level-0">' +
          '<ellipse rx="125.859375" ry="28.834375" class="root-ellipse"></ellipse>' +
          '<rect x="-95.859375" y="-18.5" width="191.71875" height="29.5"></rect>' +
          '<text cols="60" rows="4" y="9">' +
          '<tspan x="0" dy="0">New Mindmap</tspan>' +
          '</text></g></g></svg> ' +
          '</div>';
        setFixtures(fixture);
        event.keyCode = 113;
        spyOn(App, "showEditor");
        document.getElementsByClassName("node")[0].dispatchEvent(event);

        expect(App.showEditor).not.toHaveBeenCalled();
      })
    });

    //it("should toggle collapsing of nodes on space key press", function () {
    //  event.keyCode = 32;
    //  spyOn(App.eventBinding, "beforeBindEventAction").and.returnValue(node);
    //  spyOn(App, "toggleCollapsedNode");
    //  document.getElementsByClassName("node")[0].dispatchEvent(event);
    //  expect(App.eventBinding.beforeBindEventAction).toHaveBeenCalled();
    //  expect(App.toggleCollapsedNode).toHaveBeenCalled();
    //});
  });

  describe("Node navigation events", function () {
    var event, node, newNode, parent;
    beforeEach(function () {
      var fixture = '<div id="mindmap"> ' +
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="9300"> ' +
        '<g transform="translate(14400,4650)"><g transform="translate(0,0)" class="node level-0 selected">' +
        '<ellipse rx="125.859375" ry="28.834375" class="root-ellipse"></ellipse>' +
        '<rect x="-95.859375" y="-18.5" width="191.71875" height="29.5"></rect>' +
        '<text cols="60" rows="4" y="9">' +
        '<tspan x="0" dy="0">New Mindmap</tspan>' +
        '</text></g></g></svg> ' +
        '</div>';
      setFixtures(fixture);

      event = document.createEvent("Events");
      event.initEvent("keydown", true, true);

      node = {_id: "node", position: "right"};
      parent = {_id: "parent", position: "right", children: [node]};
      newNode = {_id: "newNode"};
      node.parent = parent;
    });

    describe("Up/Down", function () {
      it("should call bindEventAction with appropriate params on up key press", function () {
        event.keyCode = 38;
        spyOn(App.eventBinding, "bindEventAction");

        document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[0]).toEqual(event);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[1]).toEqual(App.eventBinding.performLogicalVerticalMovement);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[2]).toEqual(App.eventBinding.performLogicalVerticalMovement);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[4]).toEqual(App.Constants.KeyPressed.UP);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args.length).toEqual(5);

      });
      it("should call bindEventAction with appropriate params on down key press", function () {
        event.keyCode = 40;
        spyOn(App.eventBinding, "bindEventAction");

        document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[0]).toEqual(event);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[1]).toEqual(App.eventBinding.performLogicalVerticalMovement);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[2]).toEqual(App.eventBinding.performLogicalVerticalMovement);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[4]).toEqual(App.Constants.KeyPressed.DOWN);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args.length).toEqual(5);
      });
    });

    describe("Left/Right", function () {
      it("should call bindEventAction with appropriate params on left key press", function () {
        event.keyCode = 37;
        spyOn(App.eventBinding, "bindEventAction");

        document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[0]).toEqual(event);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[1]).toEqual(App.eventBinding.handleCollapsing);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[2]).toEqual(App.eventBinding.getParentForEventBinding);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[4]).toEqual(App.Constants.KeyPressed.LEFT);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args.length).toEqual(5);
      });


      it("should call bindEventAction with appropriate params on right key press", function () {
        event.keyCode = 39;
        spyOn(App.eventBinding, "bindEventAction");

        document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[0]).toEqual(event);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[1]).toEqual(App.eventBinding.getParentForEventBinding);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[2]).toEqual(App.eventBinding.handleCollapsing);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args[4]).toEqual(App.Constants.KeyPressed.RIGHT);
        expect(App.eventBinding.bindEventAction.calls.mostRecent().args.length).toEqual(5);
      });
    });
  });




      xdescribe("multi select", function() {
          var parent, child1, child2, child3;
          beforeEach(function() {
              parent = new App.Node("parent", "left", null, 0);
              parent._id = "parent";
              child1 = new App.Node("child1", "left", parent, 0);
              child1._id = "child1";
              child2 = new App.Node("child2", "left", parent, 1);
              child2._id = "child2";
              child3 = new App.Node("child3", "left", parent, 2);
              child3._id = "child3";
              child1.parent = parent;
              child2.parent = parent;
              child3.parent = parent;
              parent.left = [child1, child2, child3];
          });

          //it("up reposition", function() {
          //    spyOn(App.Node, "verticalReposition");
          //    App.multiSelectedNodes = [{__data__: child3}, {__data__: child2}, {__data__: child1}];
          //
          //    App.eventBinding.verticalRepositionAction();
          //
          //    expect(App.Node.verticalReposition.calls.argsFor(0)).toEqual(child1, App.Constants.KeyPressed.UP);
          //    expect(App.Node.verticalReposition.calls.argsFor(1)).toEqual(child2, App.Constants.KeyPressed.UP);
          //    expect(App.Node.verticalReposition.calls.argsFor(2)).toEqual(child3, App.Constants.KeyPressed.UP);
          //});

          it("copy action", function() {
              spyOn(App.CopyParser, "populateBulletedFromObject").and.returnValue("A");
              App.multiSelectedNodes = [{__data__: child2}, {__data__: child1}];

              App.eventBinding.copyAction();

              expect(App.nodeToPasteBulleted[0]).toBe("A");
              expect(App.nodeToPasteBulleted[1]).toBe("A");
              expect(App.nodeToPasteBulleted.length).toBe(2);
          })
      });
  });
