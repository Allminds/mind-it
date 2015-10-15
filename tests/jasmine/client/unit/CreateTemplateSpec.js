describe('Create Template', function () {
	var div;
	beforeEach(function(){
		div = document.createElement("DIV");
        Blaze.render(Template.create, document.body);
	});
	it('should have mind map', function () {
		
        expect($(div).find("#mindmaps")[0]).not.toBeDefined();
	});

	it('should render ', function () {
		spyOn(Template.create, 'rendered')
		expect(Template.create.rendered.calls.argsFor(0)).toEqual([]);
	});

	
});

