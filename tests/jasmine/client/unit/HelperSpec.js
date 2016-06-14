describe('helper.js tests', function () {
    describe('Direction tests', function () {
        var directionToggle, rootNode, leftSubNode, firstLeftLeafNode, secondLeftLeafNode;

        beforeEach(function () {
            directionToggle = App.DirectionToggler.getInstance();

            rootNode = new App.Node("root");
            rootNode._id = "root";

            leftSubNode = new App.Node("left1", App.Constants.Direction.LEFT, rootNode, 0);
            leftSubNode._id = "left1";
            leftSubNode.parent = rootNode;

            firstLeftLeafNode = new App.Node("child1", App.Constants.Direction.LEFT, leftSubNode, 0);
            firstLeftLeafNode._id = "child1";
            firstLeftLeafNode.parent = leftSubNode;

            secondLeftLeafNode = new App.Node("child2", App.Constants.Direction.LEFT, leftSubNode, 1);
            secondLeftLeafNode._id = "child2";
            secondLeftLeafNode.parent = leftSubNode;

            rootNode.left = [leftSubNode];

            leftSubNode.childSubTree = [firstLeftLeafNode, secondLeftLeafNode];
        });

        it('should return current direction with no change', function () {
            expect(directionToggle.getCurrentDirection(), App.Constants.Direction.LEFT);
        });

        it("should change current direction after change direction", function () {
            expect(directionToggle.getCurrentDirection()).toBe(App.Constants.Direction.LEFT);

            directionToggle.changeDirection();
            expect(directionToggle.getCurrentDirection()).toBe(App.Constants.Direction.RIGHT);

            directionToggle.changeDirection();
            expect(directionToggle.getCurrentDirection()).toBe(App.Constants.Direction.LEFT);
        });

        it("Should toggle direction for root node", function () {
            spyOn(App.map, "getDataOfNodeWithClassNamesString").and.returnValue(rootNode);

            var firstCallDirection = App.calculateDirection(rootNode);
            var secondCallDirection = App.calculateDirection(rootNode);

            expect(App.map.getDataOfNodeWithClassNamesString.calls.mostRecent().args[0]).toBe(".node.selected");
            expect(firstCallDirection).toBe(App.Constants.Direction.RIGHT);
            expect(secondCallDirection).toBe(App.Constants.Direction.LEFT);
        });

        it("Should not toggle the direction for non root node", function () {
            var firstDirection = App.calculateDirection(secondLeftLeafNode);
            var secondDirection = App.calculateDirection(secondLeftLeafNode);

            expect(firstDirection).toBe(App.Constants.Direction.LEFT);
            expect(secondDirection).toBe(App.Constants.Direction.LEFT);
        });

        it("Should return the direction of the calling node for leaf node", function () {
            var actual = App.calculateDirection(secondLeftLeafNode);
            expect(actual).toBe(App.Constants.Direction.LEFT);
        });

        it("Should return the direction of sub node for a leaf node", function () {
            var actual = App.calculateDirection(firstLeftLeafNode);

            expect(actual).toBe(App.Constants.Direction.LEFT);
            expect(firstLeftLeafNode.parent.position).toBe(App.Constants.Direction.LEFT);
        });
    });

    describe('App.deselectNode', function () {
        it("should deselect a previously selected node", function () {
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

    describe('App.select', function () {
        it("Should select the node with class = level-0", function () {
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
            node.__data__ = {
                _id: "parent",
                position: null
            };

            App.select(node);

            var actualNode = d3.selectAll(".selected")[0][0];
            var expectedNode = d3.selectAll(".level-0")[0][0];

            expect(actualNode).toEqual(expectedNode);
        });
    });

    it("should be able to get nodes in order of appearance in the child sub tree", function () {
        var rootNode, leftSubNode, firstLeftLeafNode, secondLeftLeafNode;

        rootNode = new App.Node("root");
        rootNode._id = "rootNode";

        var rootNodeData = {};
        rootNodeData._id = rootNode._id;
        rootNodeData.name = rootNode.name;
        rootNodeData.childSubTree = [];

        rootNode.__data__ = rootNodeData;

        leftSubNode = new App.Node("left", App.Constants.Direction.LEFT, rootNode, 0);
        leftSubNode._id = "leftSubNode";
        leftSubNode.parent = rootNode;

        var leftSubNodeData = {};
        leftSubNodeData._id = leftSubNode._id;
        leftSubNodeData.name = leftSubNode.name;
        leftSubNodeData.left = [];
        leftSubNodeData.right = [];

        leftSubNode.__data__ = leftSubNodeData;

        firstLeftLeafNode = new App.Node("first left leaf", App.Constants.Direction.LEFT, leftSubNode, 1);
        firstLeftLeafNode._id = "firstLeftLeafNode";
        firstLeftLeafNode.parent = leftSubNode;

        var firstLeftLeafNodeData = {};
        firstLeftLeafNodeData._id = firstLeftLeafNode._id;
        firstLeftLeafNodeData.name = firstLeftLeafNode.name;
        firstLeftLeafNodeData.left = [];
        firstLeftLeafNodeData.right = [];
        firstLeftLeafNodeData.parent = leftSubNode;

        firstLeftLeafNode.__data__ = firstLeftLeafNodeData;

        secondLeftLeafNode = new App.Node("second left leaf", App.Constants.Direction.LEFT, leftSubNode, 1);
        secondLeftLeafNode._id = "secondLeftLeafNode";
        secondLeftLeafNode.parent = leftSubNode;

        var secondLeftLeafNodeData = {};
        secondLeftLeafNodeData._id = secondLeftLeafNode._id;
        secondLeftLeafNodeData.name = secondLeftLeafNode.name;
        secondLeftLeafNodeData.left = [];
        secondLeftLeafNodeData.right = [];
        secondLeftLeafNodeData.parent = leftSubNode;
        secondLeftLeafNodeData.childSubTree = [];

        secondLeftLeafNode.__data__ = secondLeftLeafNodeData;

        rootNode.left = [leftSubNode];

        leftSubNode.childSubTree = [firstLeftLeafNode, secondLeftLeafNode];

        var orderedNodes = App.getInOrderOfAppearance([secondLeftLeafNode, firstLeftLeafNode]);

        var actualOrder = orderedNodes.map(function (node) {
            return node.name;
        });

        expect(actualOrder[0]).toBe(firstLeftLeafNode.name);
        expect(actualOrder[1]).toBe(secondLeftLeafNode.name);
    });

    it("should return false when nodes are not siblings on same side", function () {
        var parent = new App.Node("parent", null, null, 0);
        parent._id = "parent";

        var child1 = new App.Node("child1", "right", parent, 0);
        child1._id = "child1";
        child1.parent = parent;

        var child2 = new App.Node("child2", "left", parent, 1);
        child2._id = "child2";
        child2.parent = parent;

        var child3 = new App.Node("child3", "left", parent, 2);
        child3._id = "child3";
        child3.parent = parent;

        parent.left = [child2, child3];
        parent.right = [child1];

        var areSiblingsOnSameSide = App.areSiblingsOnSameSide([{__data__: child1}, {__data__: child2}, {__data__: child3}]);

        expect(areSiblingsOnSameSide).toBe(false)
    });

    it("should return true when nodes are siblings on same side", function () {
        var parent = new App.Node("parent", "left", null, 0);
        parent._id = "parent";

        var child1 = new App.Node("child1", "left", parent, 0);
        child1._id = "child1";
        child1.parent = parent;

        var child2 = new App.Node("child2", "left", parent, 1);
        child2._id = "child2";
        child2.parent = parent;

        var child3 = new App.Node("child3", "left", parent, 2);
        child3._id = "child3";
        child3.parent = parent;

        parent.left = [child1, child2, child3];

        var areSiblingsOnSameSide = App.areSiblingsOnSameSide([{__data__: child1}, {__data__: child2}, {__data__: child3}]);

        expect(areSiblingsOnSameSide).toBe(true);
    });
});
