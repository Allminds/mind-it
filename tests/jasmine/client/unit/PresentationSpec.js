fdescribe('Presentation.js', function () {


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

    var createD3Node= function (nodeId) {
        var node=Mindmaps.findOne({_id:nodeId});
        var rectWidth = 150;
        var fixture = createFixture(node.name, rectWidth);
        setFixtures(fixture);
        var d3Node = d3.selectAll(".node");
        d3Node[0][0].__data__ = node;
        d3Node[0][0].__data__.isCollapsed=true;
        return d3Node[0][0];
    };


    describe('getD3NOde', function () {

        var rootNode;
        var child1;
        var child2;
        var Rchild2;
        beforeEach(function () {
            //var rectWidth = 150;
            //var fixture = createFixture("New Mindmap", rectWidth);
            //setFixtures(fixture);


            rootNode = new App.Node("root", null, null, 0);
            rootNode._id = "0";
            child1 = new App.Node("child1", "left", rootNode, 0);
            child1._id="1";
            child2 = new App.Node("child2", "right", rootNode, 0);
            child2._id="2";
            Rchild2 = new App.Node("Rchild2", "right", child2, 0);
            Rchild2._id="2.1";
            rootNode.left[0]=child1._id;
            rootNode.right[0]=child2;
            child2.childSubTree[0]=Rchild2;

            Mindmaps.insert(rootNode);
            Mindmaps.insert(child1);
            Mindmaps.insert(child2);


        });

        //it("dummy test", function () {
        //    var rectWidth = 150;
        //    var fixture = createFixture(rootNode.name, rectWidth);
        //    setFixtures(fixture);
        //    var element = d3.selectAll(".node")[0];
        //    element.__data__ = rootNode;
        //    expect(element.__data__._id).toBe("12345");
        //});

        it('should return undefined if node id passed to function does not exists on UI', function () {
            var randomId = "randomId123";
            var d3Node = App.presentation.getD3Node(randomId);
            expect(d3Node).toBe(undefined);
        });

        it('should return d3 element if passed node id is valid', function () {
            spyOn(d3, "selectAll").and.returnValue(createD3Node(rootNode));
            var result = App.presentation.getD3Node(rootNode._id);
            expect(result).toBe(d3Node[0][0]);
        });

        fit("should call App.toggleCollapsedNode when collapsed non root node is passed to expandSubtree function ", function(){
            spyOn(App.presentation, 'getD3Node').and.callFake(function(nodeId){
                return createD3Node(nodeId);
            });
            spyOn(App,'toggleCollapsedNode');
            expect(App.presentation.getD3Node(child1._id).__data__.name).toBe("child1");
            App.presentation.expandSubTree(child2);
            expect( App.toggleCollapsedNode).toHaveBeenCalledWith(createD3Node(child2._id).__data__);

        });

    });
});