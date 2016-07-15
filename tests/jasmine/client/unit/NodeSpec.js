describe('lib.Node.js', function () {
    describe('Node constructor', function () {
        it("should be able to access application Node object globally", function () {
            expect(App.Node).not.toBeNull();
        });

        it("parentId should be root node id for level-1 child", function () {
            var rootNode = new App.Node('root');
            rootNode._id = 'rootId';
            var childnode = new App.Node('child1', 'left', rootNode, 0);
            expect(childnode.parentId).toBe(rootNode._id);
        });

        it("parentId should be level-1 node for a level-2 child", function () {
            var rootNode = new App.Node('root');
            rootNode._id = 'rootId';
            var childnode = new App.Node('child1', 'left', rootNode, 0);
            childnode._id = 'child1';
            var leafnode = new App.Node('child2', 'left', childnode, 0);

            expect(leafnode.parentId).toBe(childnode._id);
        });

        it("rootId of a child should be updated for every child", function () {
            var rootNode = new App.Node('root');
            rootNode._id = 'rootId';
            var childnode = new App.Node('child1', 'left', rootNode, 0);
            expect(childnode.rootId).toBe(rootNode._id);
            childnode._id = 'child1';
            var leafnode = new App.Node('child2', 'left', childnode, 0);
            expect(leafnode.rootId).toBe(rootNode._id);
        });
    });

    describe('App.Node.js methods', function () {
        var mindMapService;
        beforeEach(function () {
            mindMapService = App.MindMapService.getInstance();
        });

        describe('getDirection', function () {
            var rootNode, rightSubNode, leftSubNode, rightLeafNode, leftLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                rightLeafNode = new App.Node("right leaf one", App.Constants.Direction.RIGHT, rightSubNode, 1);
                rightLeafNode._id = "rightLeafNode";
                rightLeafNode.parent = rightSubNode;

                leftLeafNode = new App.Node("left leaf one", App.Constants.Direction.LEFT, leftSubNode, 1);
                leftLeafNode._id = "leftLeafNode";
                leftLeafNode.parent = leftSubNode;

                rootNode.left = [leftSubNode];
                rootNode.right = [rightSubNode];

                rightSubNode.childSubTree = [rightLeafNode];
                leftSubNode.childSubTree = [leftLeafNode];
            });

            it('Should return null for no input', function () {
                var direction = App.Node.getDirection();

                expect(direction).toBe(null);
            });

            it('Should return null for null', function () {
                var direction = App.Node.getDirection(null);

                expect(direction).toBe(null);
            });

            it("should return 'root' for root node", function () {
                var direction = App.Node.getDirection(rootNode);
                expect(direction).toBe(App.Constants.Direction.ROOT);
            });

            it("should return 'right' for right sub node", function () {
                var direction = App.Node.getDirection(rightSubNode);

                expect(direction).toBe(App.Constants.Direction.RIGHT);
            });

            it("should return 'left' for left sub node", function () {
                var direction = App.Node.getDirection(leftSubNode);

                expect(direction).toBe(App.Constants.Direction.LEFT);
            });

            it("should return 'right' for right leaf node", function () {
                var direction = App.Node.getDirection(rightLeafNode);

                expect(direction).toBe(App.Constants.Direction.RIGHT);
            });

            it("should return 'left' for left leaf node", function () {
                var direction = App.Node.getDirection(leftLeafNode);

                expect(direction).toBe(App.Constants.Direction.LEFT);
            });
        });

        describe('isRoot', function () {
            var rootNode, rightSubNode, leftSubNode, rightLeafNode, leftLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                rightLeafNode = new App.Node("right leaf one", App.Constants.Direction.RIGHT, rightSubNode, 1);
                rightLeafNode._id = "rightLeafNode";
                rightLeafNode.parent = rightSubNode;

                leftLeafNode = new App.Node("left leaf one", App.Constants.Direction.LEFT, leftSubNode, 1);
                leftLeafNode._id = "leftLeafNode";
                leftLeafNode.parent = leftSubNode;

                rootNode.left = [leftSubNode];
                rootNode.right = [rightSubNode];

                rightSubNode.childSubTree = [rightLeafNode];
                leftSubNode.childSubTree = [leftLeafNode];
            });

            it('Should return false for no input', function () {
                expect(App.Node.isRoot()).toBe(false);
            });

            it('Should return false for null', function () {
                expect(App.Node.isRoot()).toBe(false);
            });

            it("isRoot should return 'true' for root node", function () {
                expect(App.Node.isRoot(rootNode)).toBe(true);
            });

            it("isRoot should return 'false' for right sub node", function () {
                expect(App.Node.isRoot(rightSubNode)).toBe(false);
            });

            it("isRoot should return 'false' for left sub node", function () {
                expect(App.Node.isRoot(leftSubNode)).toBe(false);
            });

            it("isRoot should return 'false' for right leaf node", function () {
                expect(App.Node.isRoot(rightLeafNode)).toBe(false);
            });

            it("isRoot should return 'false' for left leaf node", function () {
                expect(App.Node.isRoot(leftLeafNode)).toBe(false);
            });
        });

        describe('getSubTree', function () {
            var rootNode, rightSubNode, leftSubNode, firstRightLeafNode, secondRightLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                firstRightLeafNode = new App.Node("right leaf one", App.Constants.Direction.RIGHT, rightSubNode, 1);
                firstRightLeafNode._id = "firstRightLeafNode";
                firstRightLeafNode.parent = rightSubNode;

                secondRightLeafNode = new App.Node("right leaf two", App.Constants.Direction.RIGHT, rightSubNode, 1);
                secondRightLeafNode._id = "secondRightLeafNode";
                secondRightLeafNode.parent = rightSubNode;

                rootNode.right = [rightSubNode];
                rootNode.left = [leftSubNode];

                rightSubNode.childSubTree = [firstRightLeafNode, secondRightLeafNode];
            });

            it('should return child nodes for provided root node without direction', function () {
                var actual = App.Node.getSubTree(rootNode);

                expect(actual).toEqual([]);
            });

            it('should return child nodes for provided root node for right direction', function () {
                var actual = App.Node.getSubTree(rootNode, App.Constants.Direction.RIGHT);
                var expected = [rightSubNode];

                expect(actual).toEqual(expected);
            });

            it('should return child nodes for provided root node for left direction', function () {
                var actual = App.Node.getSubTree(rootNode, App.Constants.Direction.LEFT);
                var expected = [leftSubNode];

                expect(actual).toEqual(expected);
            });

            it('should return child nodes for provided non root parent node with direction value', function () {
                var actual = App.Node.getSubTree(rightSubNode, App.Constants.Direction.RIGHT);
                var expected = [firstRightLeafNode, secondRightLeafNode];

                expect(actual).toEqual(expected);
            });

            it('should return child nodes for provided non root parent node without direction value', function () {
                var actual = App.Node.getSubTree(rightSubNode);
                var expected = [firstRightLeafNode, secondRightLeafNode];

                expect(actual).toEqual(expected);
            });
        });

        describe("App.Node db methods", function () {
            var root, parent, child1, child2, child3;
            beforeEach(function () {
                root = new App.Node("root");
                root._id = "root";

                parent = new App.Node("parent", "left", root, 0);
                parent._id = "parent";
                parent.parent = root;

                child1 = new App.Node("child1", "left", parent, 0);
                child1._id = "child1";
                child1.parent = parent;

                child2 = new App.Node("child2", "left", parent, 1);
                child2._id = "child2";
                child2.parent = parent;

                child3 = new App.Node("child3", "left", parent, 1);
                child3._id = "child3";
                child3.parent = parent;

                parent.childSubTree = [child1, child2, child3];

                root.left.push(parent);
            });

            it("should create new node in DB", function () {
                var newNode = new App.Node('newNode');
                spyOn(App.MindMapService.getInstance(), "addNode").and.returnValue("id");
                var node = App.Node.addToDatabase(newNode);
                expect(node._id).toBe("id");
            });

            it("should call mindMapService.updateNode with parentId for updateParentIdOfNode function call", function () {
                spyOn(mindMapService, "updateNode");
                App.Node.updateParentIdOfNode(child1, root._id);
                expect(mindMapService.updateNode).toHaveBeenCalledWith(child1._id, {parentId: root._id});
            });

            it("should call mindMapService.updateNode with childSubTree for updateChildTree function call on parent", function () {
                spyOn(mindMapService, "updateNode");
                App.Node.updateChildTree(parent, "childSubTree", parent.childSubTree.map(function (_) {
                    return _._id;
                }));
                expect(mindMapService.updateNode).toHaveBeenCalledWith(parent._id, {childSubTree: ['child1', 'child2', 'child3']});
            });

            it("should not call mindMapService.updateNode on root if subtree name is not provided", function () {
                spyOn(mindMapService, "updateNode");
                App.Node.updateChildTree(root);
                expect(mindMapService.updateNode).not.toHaveBeenCalled();
            });

            it("should call mindMapService.updateNode on root if subtree name is provided", function () {
                spyOn(mindMapService, "updateNode");
                App.Node.updateChildTree(root, 'left', root.left.map(function (_) {
                    return _._id;
                }));
                expect(mindMapService.updateNode).toHaveBeenCalledWith(root._id, {left: ['parent']});
            });

            it("should delete a node and call mindMapService.updateNode method", function () {
                spyOn(mindMapService, "updateNode");
                App.Node.delete(child1);
                expect(mindMapService.updateNode).toHaveBeenCalledWith(parent._id, {childSubTree: ['child2', 'child3']});
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
                child1.parent = parent;

                child2 = new App.Node("child2", "right", parent, 1);
                child2._id = "child2";
                child2.parent = parent;

                child3 = new App.Node("child3", "right", parent, 1);
                child3._id = "child3";
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

        describe("Repositioning Horizontal", function () {
            var root, left1, child1, child2, child3;
            beforeEach(function () {
                root = new App.Node("root");
                root._id = "root";

                left1 = new App.Node("left1", "left", root, 0);
                left1._id = "left1";
                left1.parent = root;

                child1 = new App.Node("child1", "left", left1, 0);
                child1._id = "child1";
                child1.parent = left1;

                child2 = new App.Node("child2", "left", left1, 1);
                child2._id = "child2";
                child2.parent = left1;

                child3 = new App.Node("child3", "left", left1, 1);
                child3._id = "child3";
                child3.parent = left1;

                root.left = [left1];

                left1.childSubTree = [child1, child2, child3];
            });

            it("should return false reposition horizontal key press on root node", function () {
                var actualValue = App.Node.horizontalReposition([root], App.Constants.KeyPressed.LEFT);
                expect(actualValue).toBe(false);
                actualValue = App.Node.horizontalReposition([root], App.Constants.KeyPressed.RIGHT);
                expect(actualValue).toBe(false);
            });

            it("should not change the position of left child in root for mod+LEFT when child does not have any siblings", function () {
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.LEFT);
                expect(root.left[0]).toBe(left1);
            });

            it("should put the left child in root into right subtree for mod+RIGHT", function () {
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.RIGHT);
                expect(App.Node.reposition).toHaveBeenCalledWith(left1, root, root.right, 0);
            });

            it("should not remove the left child in root from left subtree for mod+RIGHT", function () {
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.RIGHT);
                expect(root.left[0]).toBe(left1);
            });

            it("should not change the parentId of the left child in root when mod+RIGHT is pressed", function () {
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.RIGHT);
                expect(left1.parentId).toBe(root._id);
            });

            it("should put the left root child back into left subtree of root on mod+RIGHT - mod+LEFT key press", function () {
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.RIGHT);
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.LEFT);
                expect(root.left[0]).toBe(left1);
            });

            it("should put the left root child at the end of the right subtree of root on mod+RIGHT key press", function () {
                var right1 = new App.Node("right1", "right", root, 0);
                root.right = [right1];
                right1.parent = root;
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.RIGHT);
                expect(App.Node.reposition.calls.mostRecent().args[3]).toBe(1);
            });

            it("should put left1 as the last child of left2 on mod+LEFT key press", function () {
                var left2 = new App.Node("left2", "left", root, 0);
                left2._id = "left2";
                var left2Child1 = new App.Node("left2Child1", "left", left2, 0);
                left2Child1._id = "left2Child1";
                left2.childSubTree = [left2Child1];
                left2Child1.parent = left2;
                root.left.push(left2);
                left2.parent = root;
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.LEFT);
                expect(App.Node.reposition).toHaveBeenCalledWith(left1, left2, left2.childSubTree, 1);
            });

            it("should put left3 as the last child of left2 on mod+LEFT key press", function () {
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
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([left3], App.Constants.KeyPressed.LEFT);
                expect(App.Node.reposition).toHaveBeenCalledWith(left3, left2, left2.childSubTree, 1);
            });

            it("should not change the parentId of left1 object as left2 on mod+LEFT key press", function () {
                var left2 = new App.Node("left2", "left", root, 0);
                left2._id = "left2";
                var left2Child1 = new App.Node("left2Child1", "left", left2, 0);
                left2Child1._id = "left2Child1";
                left2.childSubTree = [left2Child1];
                left2Child1.parent = left2;
                root.left.push(left2);
                left2.parent = root;
                App.Node.horizontalReposition([left1], App.Constants.KeyPressed.LEFT);
                expect(left1.parentId).not.toBe(left2._id);
            });

            it("should put child3 as the last child of child2 on mod+LEFT key press", function () {
                var child2child1 = new App.Node("child2child1", "left", child2, 0);
                child2child1._id = "child2child1";
                child2child1.parent = child2;
                child2.childSubTree.push(child2child1);
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([child3], App.Constants.KeyPressed.LEFT);
                expect(App.Node.reposition).toHaveBeenCalledWith(child3, child2, child2.childSubTree, 1);
            });

            it("should put child1 as the last child of child2 on mod+LEFT key press", function () {
                var child2child1 = new App.Node("child2child1", "left", child2, 0);
                child2child1._id = "child2child1";
                child2child1.parent = child2;
                child2.childSubTree.push(child2child1);
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([child1], App.Constants.KeyPressed.LEFT);
                expect(App.Node.reposition).toHaveBeenCalledWith(child1, child2, child2.childSubTree, 1);
            });

            it("should put child2 as the second child in left subtree of root on mod+RIGHT key press on child2", function () {
                var left2 = new App.Node("left2", "left", root, 0);
                left2._id = "left2";
                root.left.push(left2);
                left2.parent = root;
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([child2], App.Constants.KeyPressed.RIGHT);
                expect(App.Node.reposition).toHaveBeenCalledWith(child2, root, root.left, 1);
            });

            it("should put child2child1 as the third child of left1 on mod+RIGHT key press on child2child1", function () {
                var child2child1 = new App.Node("child2child1", "left", child2, 0);
                child2child1._id = "child2child1";
                child2child1.parent = child2;
                child2.childSubTree.push(child2child1);
                spyOn(App.Node, "reposition");
                App.Node.horizontalReposition([child2child1], App.Constants.KeyPressed.RIGHT);
                expect(App.Node.reposition).toHaveBeenCalledWith(child2child1, left1, left1.childSubTree, 2);
            });

            it("should call updateChildTree twice, followed by updateParentIdofNode", function () {
                spyOn(App.Node, "updateChildTree");
                spyOn(App.Node, "updateParentIdOfNode");

                var child2child1 = new App.Node("child2child1", "left", child2, 0);
                child2child1._id = "child2child1";
                child2child1.parent = child2;
                child2.childSubTree.push(child2child1);
                App.Node.horizontalReposition([child2child1], App.Constants.KeyPressed.RIGHT);
                expect(App.Node.updateChildTree.calls.count()).toBe(2);
                expect(App.Node.updateParentIdOfNode).toHaveBeenCalledWith(child2child1, left1._id);
            });
        });

        describe("Reposition", function () {
            var root, left1, child1, child2, child3;
            beforeEach(function () {
                root = new App.Node("root");
                root._id = "root";

                left1 = new App.Node("left1", "left", root, 0);
                left1._id = "left1";
                left1.parent = root;

                child1 = new App.Node("child1", "left", left1, 0);
                child1._id = "child1";
                child1.parent = left1;

                child2 = new App.Node("child2", "left", left1, 1);
                child2._id = "child2";
                child2.parent = left1;

                child3 = new App.Node("child3", "left", left1, 1);
                child3._id = "child3";
                child3.parent = left1;

                root.left = [left1];

                left1.childSubTree = [child1, child2, child3];
            });

            it("should call functions in sequence when reposition is called with two parameters.", function () {
                spyOn(App.Node, "updateParentIdOfNode");
                spyOn(App.Node, "updateChildTree");

                App.Node.reposition(child1, root);

                expect(App.Node.updateParentIdOfNode).toHaveBeenCalledWith(child1, root._id);
                expect(App.Node.updateChildTree.calls.count()).toBe(2);
                expect(App.Node.updateChildTree.calls.mostRecent().args[0]).toBe(left1);
                expect(App.Node.updateChildTree.calls.mostRecent().args[1]).toBe("left");
                expect(App.Node.updateChildTree.calls.mostRecent().args[2]).toEqual(["child2", "child3"]);
            });

            it("should call functions in sequence when reposition is called with two parameters.", function () {
                spyOn(App.Node, "updateParentIdOfNode");
                spyOn(App.Node, "updateChildTree");

                App.Node.reposition(child1, root, left1.childSubTree, 0);

                expect(App.Node.updateParentIdOfNode).toHaveBeenCalledWith(child1, root._id);
                expect(App.Node.updateChildTree.calls.argsFor(0)[0]).toBe(root);
                expect(App.Node.updateChildTree.calls.argsFor(0)[1]).toBe("left");
                expect(App.Node.updateChildTree.calls.argsFor(0)[2]).toEqual(["child1", "child1", "child2", "child3"]);
                expect(App.Node.updateChildTree.calls.count()).toBe(2);
            });
        });

        describe('Get only immediate child nodes', function () {
            var rootNode, rightSubNode, leftSubNode, firstLeftLeafNode, secondLeftLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                firstLeftLeafNode = new App.Node("first left leaf", App.Constants.Direction.LEFT, leftSubNode, 1);
                firstLeftLeafNode._id = "firstLeftLeafNode";
                firstLeftLeafNode.parent = leftSubNode;

                secondLeftLeafNode = new App.Node("second left leaf", App.Constants.Direction.RIGHT, rightSubNode, 1);
                secondLeftLeafNode._id = "secondLeftLeafNode";
                secondLeftLeafNode.parent = leftSubNode;

                rootNode.left = [leftSubNode];
                rootNode.right = [rightSubNode];

                leftSubNode.childSubTree = [firstLeftLeafNode, secondLeftLeafNode];
            });

            it('Should return empty array when leaf node is passed', function () {
                expect(App.Node.immediateSubNodes(firstLeftLeafNode)).toEqual([]);
            });

            it('Should return all leaf nodes when sub node is passed', function () {
                expect(App.Node.immediateSubNodes(leftSubNode)).toEqual([firstLeftLeafNode, secondLeftLeafNode]);
            });

            it('Should return right sub nodes then left sub nodes when root node is passed', function () {
                expect(App.Node.immediateSubNodes(rootNode)).toEqual([rightSubNode, leftSubNode]);
            });
        });

        describe('isDeleted', function () {
            var rootNode, rightSubNode, leftSubNode, rightLeafNode, leftLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                rightLeafNode = new App.Node("right leaf node", App.Constants.Direction.LEFT, rightSubNode, 1);
                rightLeafNode._id = "rightLeafNode";
                rightLeafNode.parent = rightSubNode;

                leftLeafNode = new App.Node("left leaf node", App.Constants.Direction.RIGHT, leftSubNode, 1);
                leftLeafNode._id = "leftLeafNode";
                leftLeafNode.parent = leftSubNode;

                rootNode.left = [leftSubNode];
                rootNode.right = [rightSubNode];

                rightSubNode.childSubTree = [rightLeafNode];
                leftSubNode.childSubTree = [leftLeafNode];
            });

            it('Should return false when root node', function () {
                expect(App.Node.isDeleted(rootNode)).toBe(false);
            });

            it('Should return false when right sub node', function () {
                expect(App.Node.isDeleted(rightSubNode)).toBe(false);
            });

            it('Should return false when left sub node', function () {
                expect(App.Node.isDeleted(leftSubNode)).toBe(false);
            });

            it('Should return false when right leaf node', function () {
                expect(App.Node.isDeleted(leftSubNode)).toBe(false);
            });

            it('Should return false when left leaf node', function () {
                expect(App.Node.isDeleted(leftSubNode)).toBe(false);
            });

            it('Should return true when right sub node is deleted', function () {
                rootNode.right = [];
                expect(App.Node.isDeleted(rightSubNode)).toBe(true);
            });

            it('Should return true when left sub node is deleted', function () {
                rootNode.left = [];
                expect(App.Node.isDeleted(leftSubNode)).toBe(true);
            });

            it('Should return true when right leaf node is deleted', function () {
                rightSubNode.childSubTree = [];
                expect(App.Node.isDeleted(rightLeafNode)).toBe(true);
            });

            it('Should return true when left leaf node is deleted', function () {
                leftSubNode.childSubTree = [];
                expect(App.Node.isDeleted(leftLeafNode)).toBe(true);
            });
        });

        describe('isSubNode', function () {
            var rootNode, rightSubNode, leftSubNode, rightLeafNode, leftLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                rightLeafNode = new App.Node("right leaf node", App.Constants.Direction.LEFT, rightSubNode, 1);
                rightLeafNode._id = "rightLeafNode";
                rightLeafNode.parent = rightSubNode;

                leftLeafNode = new App.Node("left leaf node", App.Constants.Direction.RIGHT, leftSubNode, 1);
                leftLeafNode._id = "leftLeafNode";
                leftLeafNode.parent = leftSubNode;

                rootNode.left = [leftSubNode];
                rootNode.right = [rightSubNode];

                rightSubNode.childSubTree = [rightLeafNode];
                leftSubNode.childSubTree = [leftLeafNode];
            });

            it('Should return false for root node', function () {
                expect(App.Node.isSubNode(rootNode)).toBe(false);
            });

            describe('Should return true for nodes having child nodes', function () {
                it('Should return true for right sub node', function () {
                    expect(App.Node.isSubNode(rightSubNode)).toBe(true);
                });

                it('Should return true for left sub node', function () {
                    expect(App.Node.isSubNode(leftSubNode)).toBe(true);
                });
            });

            describe('Should return false for leaf nodes', function () {
                it('Should return false for right leaf node', function () {
                    expect(App.Node.isSubNode(rightLeafNode)).toBe(false);
                });

                it('Should return false for left leaf node', function () {
                    expect(App.Node.isSubNode(leftLeafNode)).toBe(false);
                });
            });
        });

        describe('isLeafNode', function () {
            var rootNode, rightSubNode, leftSubNode, rightLeafNode, leftLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                rightLeafNode = new App.Node("right leaf node", App.Constants.Direction.LEFT, rightSubNode, 1);
                rightLeafNode._id = "rightLeafNode";
                rightLeafNode.parent = rightSubNode;

                leftLeafNode = new App.Node("left leaf node", App.Constants.Direction.RIGHT, leftSubNode, 1);
                leftLeafNode._id = "leftLeafNode";
                leftLeafNode.parent = leftSubNode;

                rootNode.left = [leftSubNode];
                rootNode.right = [rightSubNode];

                rightSubNode.childSubTree = [rightLeafNode];
                leftSubNode.childSubTree = [leftLeafNode];
            });

            it('Should return false for root node', function () {
                expect(App.Node.isLeafNode(rootNode)).toBe(false);
            });

            describe('Should return false for nodes having child nodes', function () {
                it('Should return false for right sub node', function () {
                    expect(App.Node.isLeafNode(rightSubNode)).toBe(false);
                });

                it('Should return false for left sub node', function () {
                    expect(App.Node.isLeafNode(leftSubNode)).toBe(false);
                });
            });

            describe('Should return true for leaf nodes', function () {
                it('Should return true for right leaf node', function () {
                    expect(App.Node.isLeafNode(rightLeafNode)).toBe(true);
                });

                it('Should return true for left leaf node', function () {
                    expect(App.Node.isLeafNode(leftLeafNode)).toBe(true);
                });
            });
        });

        describe('selectedNodes', function () {
            it('Should return empty array when no nodes selected', function () {
                var actualSelectedNodes = App.Node.selectedNodes();
                expect(actualSelectedNodes.length).toBe(0);
            });

            it('Should return one selected node when only one node is selected', function () {
                var expectedNode = new App.Node('ExpectedNode');

                var selectedNodes = [[expectedNode]];
                spyOn(d3, "selectAll").and.returnValue(selectedNodes);

                var actualSelectedNodes = App.Node.selectedNodes();
                var selectedNode = actualSelectedNodes[0];

                expect(actualSelectedNodes.length).toBe(1);
                expect(selectedNode.name).toBe(expectedNode.name);
            });

            it('Should more than one node when more than one node is selected', function () {
                var firstExpectedNode = new App.Node('firstExpectedNode');
                var secondExpectedNode = new App.Node('secondExpectedNode');

                var selectedNodes = [[firstExpectedNode, secondExpectedNode]];
                spyOn(d3, "selectAll").and.returnValue(selectedNodes);

                var actualSelectedNodes = App.Node.selectedNodes();
                var firstSelectedNode = actualSelectedNodes[0];
                var secondSelectedNode = actualSelectedNodes[1];

                expect(actualSelectedNodes.length).toBeGreaterThan(1);
                expect(firstSelectedNode.name).toBe(firstExpectedNode.name);
                expect(secondSelectedNode.name).toBe(secondExpectedNode.name);
            });
        });

        describe('isSubNode and isLeafNode are mutually exclusive except when root node', function () {
            var rootNode, rightSubNode, leftSubNode, rightLeafNode, leftLeafNode;
            beforeEach(function () {
                rootNode = new App.Node("root");
                rootNode._id = "rootNode";

                rightSubNode = new App.Node("right", App.Constants.Direction.RIGHT̰, rootNode, 0);
                rightSubNode._id = "rightSubNode";
                rightSubNode.parent = rootNode;

                leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
                leftSubNode._id = "leftSubNode";
                leftSubNode.parent = rootNode;

                rightLeafNode = new App.Node("right leaf node", App.Constants.Direction.LEFT, rightSubNode, 1);
                rightLeafNode._id = "rightLeafNode";
                rightLeafNode.parent = rightSubNode;

                leftLeafNode = new App.Node("left leaf node", App.Constants.Direction.RIGHT, leftSubNode, 1);
                leftLeafNode._id = "leftLeafNode";
                leftLeafNode.parent = leftSubNode;

                rootNode.left = [leftSubNode];
                rootNode.right = [rightSubNode];

                rightSubNode.childSubTree = [rightLeafNode];
                leftSubNode.childSubTree = [leftLeafNode];
            });

            it('Should return false when root node', function () {
                expect(App.Node.isSubNode(rootNode)).toBe(false);
                expect(App.Node.isLeafNode(rootNode)).toBe(false);
            });

            describe('Should return true for sub node and false for leaf node', function () {
                it('Should return true for sub node and false for leaf node when node is a right sub node', function () {
                    expect(App.Node.isSubNode(rightSubNode)).toBe(true);
                    expect(App.Node.isLeafNode(rightSubNode)).toBe(false);
                });

                it('Should return true for sub node and false for leaf node when node is a left sub node', function () {
                    expect(App.Node.isSubNode(leftSubNode)).toBe(true);
                    expect(App.Node.isLeafNode(leftSubNode)).toBe(false);
                });
            });

            describe('Should return false for sub node and true for leaf node', function () {
                it('Should return false for sub node and true for leaf node when node is a right leaf node', function () {
                    expect(App.Node.isSubNode(rightLeafNode)).toBe(false);
                    expect(App.Node.isLeafNode(rightLeafNode)).toBe(true);
                });

                it('Should return false for sub node and true for leaf node when node is a left leaf node', function () {
                    expect(App.Node.isSubNode(leftLeafNode)).toBe(false);
                    expect(App.Node.isLeafNode(leftLeafNode)).toBe(true);
                });
            });
        });
    });
});
