describe('Presentation.js', function () {
    var createFixture = function (nodeText, rectWidth) {
        var fixture = '<div id="mindmap">' +
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="15560">' +
            '<g transform="translate(14400,7780)">' +
            '<g transform="translate(0,0)" class="node level-0 selected">' +
            '<ellipse rx="106.6875" ry="28.0675" class="root-ellipse"></ellipse>' +
            '<rect x="-76.6875" y="-13" width="' + rectWidth + '" height="22.5"></rect>' +
            '<text cols="60" rows="4" y="9"><tspan x="0" dy="0">' + nodeText + '</tspan></text>' +
            '<circle class="indicator unfilled" r="0" cx="76.6875"></circle>' +
            '</g>' +
            '</g>' +
            '</svg>' +
            '</div>';
        return fixture;
    };

    var createD3Node = function (nodeId) {
        var node = Mindmaps.findOne({_id: nodeId});
        var rectWidth = 150;
        var fixture = createFixture(node.name, rectWidth);

        setFixtures(fixture);

        var d3Node = d3.selectAll(".node");
        d3Node[0][0].__data__ = node;
        d3Node[0][0].__data__.isCollapsed = true;

        return d3Node[0][0];
    };

    describe('getD3Node', function () {
        var rootNode, leftSubNode, rightSubNode, rightLeafNode;

        beforeAll(function () {
            rootNode = new App.Node("root", null, null, 0);
            rootNode._id = "rootNode";

            leftSubNode = new App.Node("left", "left", rootNode, 0);
            leftSubNode._id = "leftSubNode";

            rightSubNode = new App.Node("right", "right", rootNode, 0);
            rightSubNode._id = "rightSubNode";

            rightLeafNode = new App.Node("Rchild2", "right", rightSubNode, 0);
            rightLeafNode._id = "rightLeafNode";

            rootNode.left[0] = leftSubNode._id;
            rootNode.right[0] = rightSubNode._id;

            rightSubNode.childSubTree[0] = rightLeafNode._id;

            Mindmaps.insert(rootNode);
            Mindmaps.insert(leftSubNode);
            Mindmaps.insert(rightSubNode);
            Mindmaps.insert(rightLeafNode);
        });

        it('should return undefined if node id passed to function does not exists on UI', function () {
            var randomId = "randomId123";
            var d3Node = App.presentation.getD3Node(randomId);

            expect(d3Node).toBe(undefined);
        });

        it('should return d3 element if passed node id is valid', function () {
            var rectWidth = 150;
            var fixture = createFixture(rootNode.name, rectWidth);
            setFixtures(fixture);
            var d3Node = d3.selectAll(".node");
            d3Node[0][0].__data__ = rootNode;
            spyOn(d3, "selectAll").and.returnValue(d3Node);
            var result = App.presentation.getD3Node(rootNode._id);
            expect(result).toBe(d3Node[0][0]);
        });

        it("should call App.toggleCollapsedNode when collapsed non root node is passed to expandSubtree function ", function () {
            spyOn(App.presentation, 'getD3Node').and.callFake(function (nodeId) {
                return createD3Node(nodeId);
            });
            spyOn(App.presentation, 'getRootNode').and.callFake(function () {
                return rootNode;
            });
            spyOn(App, 'toggleCollapsedNode');

            expect(App.presentation.getD3Node(leftSubNode._id).__data__.name).toBe("left");

            App.presentation.expandAll();
            expect(App.toggleCollapsedNode).toHaveBeenCalledWith(createD3Node(rightSubNode._id).__data__);

        });

        it("should call App.toggleCollapsedNode when collapseAll is called ", function () {
            spyOn(App.presentation, 'getD3Node').and.callFake(function (nodeId) {
                return createD3Node(nodeId);
            });
            spyOn(App.presentation, 'getRootNode').and.callFake(function () {
                return rootNode;
            });
            spyOn(App, 'toggleCollapsedNode');
            App.presentation.collapseAll();
            expect(App.toggleCollapsedNode).toHaveBeenCalledWith(createD3Node(rightSubNode._id).__data__);
        })

        it("should call toggleCollapseNode with collapsed non root node i.e. child2  in this case, as an argument when expandAll is called", function () {
            spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
            spyOn(App.presentation, 'getD3Node').and.callFake(function (nodeId) {
                return createD3Node(nodeId);
            });
            spyOn(App, 'toggleCollapsedNode');
            App.presentation.expandAll();
            var d3NodeOfChild2 = createD3Node(rightSubNode._id);
            expect(App.toggleCollapsedNode).toHaveBeenCalledWith(d3NodeOfChild2.__data__);
        });

        it("should call toggleCollapseNode with expanded non root node i.e. child2  in this case, as an argument when collapseAll is called", function () {
            spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
            spyOn(App.presentation, 'getD3Node').and.callFake(function (nodeId) {
                return createD3Node(nodeId);
            });
            spyOn(App, 'toggleCollapsedNode');
            App.presentation.collapseAll();
            var d3NodeOfChild2 = createD3Node(rightSubNode._id);
            expect(App.toggleCollapsedNode).toHaveBeenCalledWith(d3NodeOfChild2.__data__);
        });
    });
});