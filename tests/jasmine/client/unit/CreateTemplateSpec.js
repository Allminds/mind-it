/* global getWidth */
/* global spyOn */
/* global expect */
/* global it */
/* global Blaze */
/* global beforeEach */
/* global describe */
/* global $ */
/* global Template */
describe('Create Template', function () {
	var div;
	beforeEach(function(){
		div = document.createElement("DIV");
        Blaze.render(Template.create, document.body);
	});
	it('should have mind map', function () {
        expect($(div).find("#mindmaps")[0]).not.toBeDefined();
	});


	it('should have default width 80px when node anonymous', function(){
		var node = {name:null};
		expect(getWidth(node)).toBe(80);
	});
	
	it('should increase width of ellipse if name of the node increased in lenght',function(){
		var node = { name:'New Node'},
			currentWidth = getWidth(node),
			incresedWidth;
		node.name += ' increased';
		
		incresedWidth = getWidth(node);
		expect(incresedWidth > currentWidth).toBeTruthy();	
	});


});

