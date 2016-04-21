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
                var node = {children: []};
                node.depth = 2;
                expect(App.eventBinding.findSameLevelChild(node, 2, 0)).toBe(node);
            });
        });

        xdescribe('App.eventBinding.performLogicalVerticalMovement', function () {
            it("should select downward node on performing vertical movement for down key press action", function () {
                var first = {_id: "first", depth: 1, position: "right"},
                    second = {_id: "second", depth: 1, position: "right"},
                    parent = {_id: "parent", childSubTree: [first, second]};
                first.parent = parent;

                spyOn(App, "selectNode");
                App.eventBinding.performLogicalVerticalMovement(first, App.Constants.KeyPressed.DOWN);

                expect(App.selectNode).toHaveBeenCalledWith(second);
            });

            it("should select upward node on performing vertical movement for up key press action", function () {
                var first = {_id: "first", depth: 1, position: "right"},
                    second = {_id: "second", depth: 1, position: "right"},
                    parent = {_id: "parent", children: [first, second]};
                second.parent = parent;

                spyOn(App, "selectNode");
                App.eventBinding.performLogicalVerticalMovement(second, App.Constants.KeyPressed.UP);

                expect(App.selectNode).toHaveBeenCalledWith(first);
            });
        });

        describe('event binding helpers', function () {
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

            it('should call selectNode and setPrevDepth in afterBindEventAction', function () {
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

        xit("should call all internal methods on cutNode call for node other than root", function () {
            var parent = {_id: "parent"},
                node = {_id: "node", position: "right", parent: parent};
            spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
            spyOn(App.map, "storeSourceNode");
            spyOn(Meteor, "call");
            App.cutNode();
            expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".selected");
            expect(App.map.storeSourceNode).toHaveBeenCalledWith(node);
            expect(Meteor.call.calls.mostRecent().args[0]).toBe("deleteNode");
        });

        it("Should have only one node selected after cut", function () {
            App.multiSelectedNodes = [{
                __data__: {
                    _id: "node",
                    position: "right",
                    parent: parent,
                    childSubTree: [],
                    left: [],
                    right: []
                }
            }];
            spyOn(App, "clearAllSelected");
            spyOn(App.CopyParser, "populateBulletedFromObject").and.callFake(function () {
                return "child"
            });
            App.eventBinding.copyAction();
            expect(App.clearAllSelected).toHaveBeenCalled();
        })
    });

    describe("Mousetrap ModX bindings", function () {
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

            var fixture = '<div id="mindmap">' +
                '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="43240" height="24860">' +
                '<g transform="translate(21620,12430)">' +
                '<path class="thick-link" d="M20.671875,0C45.671875,0 45.671875,0 70.671875,0"></path>' +
                '<path class="link" d="M20.671875,0C45.671875,0 45.671875,0 70.671875,0L133.046875,0"></path>' +
                '<path class="link" d="M133.046875,0C148.046875,-23 148.046875,-23 163.046875,-23L215.296875,-23"></path>' +
                '<path class="link" d="M133.046875,0C148.046875,0 148.046875,0 163.046875,0L215.296875,0"></path>' +
                '<path class="link" d="M133.046875,0C148.046875,23 148.046875,23 163.046875,23L215.296875,23"></path>' +
                '<path class="link" d="M133.046875,0C148.046875,-23 148.046875,-23 163.046875,-23"></path>' +
                '<path class="link" d="M133.046875,0C148.046875,0 148.046875,0 163.046875,0"></path>' +
                '<path class="link" d="M133.046875,0C148.046875,23 148.046875,23 163.046875,23"></path>' +
                '<g transform="translate(0,0)" class="node level-0">' +
                '<ellipse rx="50.671875" ry="25.826875" class="root-ellipse"></ellipse>' +
                '<rect x="-20.671875" y="-13" width="41.34375" height="23"></rect>' +
                '<text cols="60" rows="4" y="9" visibility="">' +
                '<tspan x="0" dy="0">root</tspan>' +
                '</text><circle class="indicator unfilled" r="0" cx="20.671875"></circle>' +
                '</g><g transform="translate(101.859375,0)" class="node level-1">' +
                '<rect x="-31.1875" y="-22" width="62.375" height="20"></rect>' +
                '<text cols="60" rows="4" y="-2" visibility="">' +
                '<tspan x="0" dy="0">parent</tspan>' +
                '</text><circle class="indicator unfilled" r="7" cx="31.1875"></circle>' +
                '</g><g transform="translate(189.171875,-23)" class="node level-2">' +
                '<rect x="-26.125" y="-20" width="52.25" height="18"></rect>' +
                '<text cols="60" rows="4" y="-2" visibility="">' +
                '<tspan x="0" dy="0">child1</tspan>' +
                '</text><circle class="indicator unfilled" r="0" cx="26.125"></circle>' +
                '</g><g transform="translate(189.171875,0)" class="node level-2">' +
                '<rect x="-26.125" y="-20" width="52.25" height="18"></rect>' +
                '<text cols="60" rows="4" y="-2" visibility="">' +
                '<tspan x="0" dy="0">child2</tspan>' +
                '</text><circle class="indicator unfilled" r="0" cx="26.125"></circle>' +
                '</g><g transform="translate(189.171875,23)" class="node level-2 selected softSelected">' +
                '<rect x="-26.125" y="-20" width="52.25" height="18"></rect>' +
                '<text cols="60" rows="4" y="-2" visibility="">' +
                '<tspan x="0" dy="0">child3</tspan>' +
                '</text><circle class="indicator unfilled" r="0" cx="26.125"></circle>' +
                '</g></g></svg>' +
                '</div>';

            setFixtures(fixture);

            App.multiSelectedNodes = [];
            var node = d3.select(".selected")[0][0];

            parent.childSubTree = [child1, child2, child3];
            node.__data__ = child3;
            d3.select(node).classed("softSelected", true);
            App.multiSelectedNodes.push(node);
        });

        it("should clear all selected nodes after mapping selectedNodes", function () {
            spyOn(App, "selectNode");
            spyOn(App, "clearAllSelected");
            Mousetrap.trigger('mod+x');
            expect(App.clearAllSelected).toHaveBeenCalled();
            expect(App.selectNode).toHaveBeenCalled();
        });
    });

    describe("Node Add/Delete/Edit/Collapse events", function () {
        var event, node, newNode, parent, fixture;
        beforeEach(function () {
            fixture = '<div id="mindmap"> ' +
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
                App.editable = true;
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

            xit("should call all the functions in newNodeAddAction function flow for enter action", function () {
                spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
                spyOn(App.eventBinding, "enterAction").and.returnValue(newNode);
                spyOn(App.eventBinding, "afterNewNodeAddition");

                App.eventBinding.newNodeAddAction(App.eventBinding.enterAction);

                expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".node.selected");
                expect(App.eventBinding.enterAction).toHaveBeenCalled();
                expect(App.eventBinding.afterNewNodeAddition).toHaveBeenCalledWith(newNode, node);
            });

            xit("should call all the functions in newNodeAddAction function flow for tab action", function () {
                spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
                spyOn(App.eventBinding, "tabAction").and.returnValue(newNode);
                spyOn(App.eventBinding, "afterNewNodeAddition");

                App.eventBinding.newNodeAddAction(App.eventBinding.tabAction);

                expect(App.map.getDataOfNodeWithClassNamesString).toHaveBeenCalledWith(".node.selected");
                expect(App.eventBinding.tabAction).toHaveBeenCalled();
                expect(App.eventBinding.afterNewNodeAddition).toHaveBeenCalledWith(newNode, node);
            });
        });

        describe("Node deletion", function () {
            var myFixture;
            beforeEach(function () {
                spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(node);
                myFixture = fixture;
                myFixture.__data__ = node;
                App.multiSelectedNodes[0] = myFixture;
            });

            xit("should call all the functions in delete keypress", function () {
                event.keyCode = 46;
                spyOn(Meteor, "call");
                spyOn(App, "getDirection").and.returnValue(node.position);
                spyOn(App.eventBinding, "focusAfterDelete");
                spyOn(App.Node, "delete");
                var d3Array = [myFixture];
                spyOn(d3, 'selectAll').and.returnValue(d3Array);
                spyOn(console, 'log');
                document.getElementsByClassName("node")[0].dispatchEvent(event);

                expect(App.Node.delete).toHaveBeenCalled();
            });

            it("should display alert when delete key is pressed on root node", function () {
                event.keyCode = 46;
                spyOn(window, "alert");
                spyOn(App, "getDirection").and.returnValue("root");

                document.getElementsByClassName("node level-0")[0].dispatchEvent(event);

                expect(window.alert).toHaveBeenCalled();
            });

        });

        describe("node editing on f2", function () {
            it("should show text box on fw if some node is selected", function () {
                event.keyCode = 113;
                spyOn(App, "showEditor");
                App.editable = true;
                var obj = {__data__: 234};
                var result = [[obj, 2], [3, 4]];
                spyOn(d3, 'select').and.returnValue(result);
                document.getElementsByClassName("node")[0].dispatchEvent(event);
                expect(App.showEditor).toHaveBeenCalled();
            });

            xit("should do nothing on f2 if no node is selected", function () {
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

        it("should toggle collapsing of nodes on space key press", function () {
            var myFixture = fixture;
            myFixture.__data__ = node;
            App.multiSelectedNodes[0] = myFixture;
            event.keyCode = 32;
            spyOn(App, "toggleCollapsedNode");
            document.getElementsByClassName("node")[0].dispatchEvent(event);
            expect(App.toggleCollapsedNode).toHaveBeenCalled();
        });
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

    describe("multi select", function () {
        var parent, child1, child2, child3;
        beforeEach(function () {
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

        it("up reposition", function () {
            spyOn(App.Node, "verticalReposition");
            App.multiSelectedNodes = [{__data__: child3}, {__data__: child2}, {__data__: child1}];

            App.eventBinding.verticalRepositionAction(App.Constants.KeyPressed.UP);

            expect(App.Node.verticalReposition).toHaveBeenCalledWith(child1, App.Constants.KeyPressed.UP);
            expect(App.Node.verticalReposition).toHaveBeenCalledWith(child2, App.Constants.KeyPressed.UP);
            expect(App.Node.verticalReposition).toHaveBeenCalledWith(child3, App.Constants.KeyPressed.UP);

        });

        it("copy action", function () {
            spyOn(App.CopyParser, "populateBulletedFromObject").and.returnValue("A");
            App.multiSelectedNodes = [{__data__: child2}, {__data__: child1}];

            App.eventBinding.copyAction();

            expect(App.nodeToPasteBulleted[0]).toBe("A");
            expect(App.nodeToPasteBulleted[1]).toBe("A");
            expect(App.nodeToPasteBulleted.length).toBe(2);
        })
    });

    describe("expandAll collapseAll", function(){
        xit("should call expandAll function when cmd+L is pressed ", function(){
            spyOn(App.presentation, 'expandAll');
            var event1 = document.createEvent("Events");
            event1.initEvent("keydown", true, true);
            event1.keyCode = 76;
            event1.metaKey = true;
            document.dispatchEvent(event1);
            expect(App.presentation.expandAll).toHaveBeenCalled();
        });

        xit("should call collapseAllMindmap function when cmd+shift+l is pressed ", function () {
            spyOn(App.presentation, 'collapseAllMindmap');
            var event1 = document.createEvent("Events");
            event1.initEvent("keydown", true, true);
            event1.keyCode = 76;
            event1.metaKey = true;
            event1.shiftKey = true;
            document.dispatchEvent(event1);
            expect(App.presentation.collapseAllMindmap).toHaveBeenCalled();
        });

        describe("Bind and Unbind events", function () {
            it("should bind all events which are in the events map", function () {
                spyOn(Mousetrap, "bind");

                App.eventBinding.bindAllEvents();
                var eventsMap = App.eventBinding.EventsMap;
                for (var event in eventsMap) {
                    expect(Mousetrap.bind).toHaveBeenCalledWith(event, eventsMap[event].method);
                }
            });

            it("should not unbind events which are allowed in read only mode", function () {
                spyOn(Mousetrap, "unbind");
                var allowedInReadOnlyModeEvents = ['shift+up', 'shift+down', 'shift+right', 'shift+left', 'mod+e', 'esc', '?', 'up',
                    'down', 'right', 'left', 'space', 'mod+shift+p', 'pageup', 'pagedown'];

                App.eventBinding.unbindEditableEvents();
                for (var event of allowedInReadOnlyModeEvents) {
                    expect(Mousetrap.unbind).not.toHaveBeenCalledWith(event);
                }
            });
        });
    });
});
