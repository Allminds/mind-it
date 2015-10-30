/* global spyOn */
/* global describe */
/* global beforeEach */
/* global it */
/* global expect */
/* globals Player: false, Song: false */

describe('MindMapService', function () {
    var mindMapService;

    beforeEach(function () {
        mindMapService = new MindMapService();
    });


    describe("addChild", function () {
        it('Should add a node to an existing node', function () {
            var name = "new mindmap", dir = "right",
                parent_node = {name: name, children: [], direction: dir},
                new_node = {name: name, children: [], direction: dir};
            mindMapService.addChild(parent_node);
            parent_node.children[0] = new_node;
            expect(parent_node.children.length).toBe(1);

        });
    });

});

 