describe('MindMapService', function () {
    var mindMapService;

    beforeEach(function () {
        mindMapService = App.MindMapService.getInstance();
    });

    describe("addChild", function () {
        it('Should add a node to an existing node', function () {
            var parent_node = new App.Node('parent'),
                new_node = new App.Node('new ', App.Constants.Direction.RIGHT, parent_node, 1);

            parent_node.right = [new_node];

            mindMapService.addChild(parent_node, new_node);
            parent_node.right[0] = new_node;

            expect(parent_node.right.length).toBe(1);
        });
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

    describe("Update root node", function () {
        beforeEach(function () {
            root = new App.Node("rootNodeName", "root", null, 0);
            root._id = "rootId";
            expectedRootNodeText = 'Untitled';
        });

        it("Should update root node text as 'Untitled' when root node text is null", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(root);
            spyOn(App.Node, 'isRoot').and.returnValue(true);

            var actualRootNodeName = getUpdatedNodeName("rootId", {name: null});

            expect(expectedRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update root node text as 'Untitled' when root node text is undefined", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(root);
            spyOn(App.Node, 'isRoot').and.returnValue(true);

            var actualRootNodeName = getUpdatedNodeName("rootId", {name: undefined});

            expect(expectedRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update root node text as 'Untitled' when root node text is empty string", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(root);
            spyOn(App.Node, 'isRoot').and.returnValue(true);

            var actualRootNodeName = getUpdatedNodeName("rootId", {name: ''});

            expect(expectedRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update root node text as 'Untitled' when root node text is white space string", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(root);
            spyOn(App.Node, 'isRoot').and.returnValue(true);

            var actualRootNodeName = getUpdatedNodeName("rootId", {name: ' '});

            expect(expectedRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update root node text as root node text when root node text is non empty, not white space string", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(root);
            spyOn(App.Node, 'isRoot').and.returnValue(true);

            var actualRootNodeName = getUpdatedNodeName("rootId", {name: 'root node text'});

            expect('root node text').toBe(actualRootNodeName.name);
        });
    });

    describe("Update non root node", function () {
        beforeEach(function () {
            nonRoot = new App.Node("nonRootNodeName", "left", null, 0);
            nonRoot._id = "nonRootId";
        });

        it("Should update non root node text as null when text is null", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(nonRoot);
            spyOn(App.Node, 'isRoot').and.returnValue(false);

            var actualRootNodeName = getUpdatedNodeName("nonRootId", {name: null});

            var expectedNonRootNodeText = null;
            expect(expectedNonRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update non root node text as undefined when text is undefined", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(nonRoot);
            spyOn(App.Node, 'isRoot').and.returnValue(false);

            var actualRootNodeName = getUpdatedNodeName("nonRootId", {name: undefined});

            var expectedNonRootNodeText = undefined;
            expect(expectedNonRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update non root node text as empty string when text is empty string", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(nonRoot);
            spyOn(App.Node, 'isRoot').and.returnValue(false);

            var actualRootNodeName = getUpdatedNodeName("nonRootId", {name: ''});

            var expectedNonRootNodeText = '';
            expect(expectedNonRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update non root node text as white space when text is white space string", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(nonRoot);
            spyOn(App.Node, 'isRoot').and.returnValue(false);

            var actualRootNodeName = getUpdatedNodeName("nonRootId", {name: ' '});

            var expectedNonRootNodeText = ' ';
            expect(expectedNonRootNodeText).toBe(actualRootNodeName.name);
        });

        it("Should update non root node text as non empty, not white space when text is non empty, not white space string", function () {
            spyOn(Mindmaps, 'findOne').and.returnValue(nonRoot);
            spyOn(App.Node, 'isRoot').and.returnValue(false);

            var actualRootNodeName = getUpdatedNodeName("nonRootId", {name: 'non root node text'});

            var expectedNonRootNodeText = 'non root node text';
            expect(expectedNonRootNodeText).toBe(actualRootNodeName.name);
        });
    })
});