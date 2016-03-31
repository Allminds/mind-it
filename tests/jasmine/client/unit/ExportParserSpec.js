describe('App.exportParser', function () {

    it('should call Mindmaps.findOne() for getting rootnode data', function () {
        //spyOn(App,'JSONConverter');
        spyOn(Mindmaps,'findOne').and.returnValue({_id:"qRbTTPjHzfoGAmW3b",name:"testtxt", left:[], right:[]});
        var returnedString=App.JSONConverter();
        var expectedString="<map version=\"1.0.1\">\n<node ID=\"qRbTTPjHzfoGAmW3b\" TEXT=\"testtxt\" >\n</node>\n</map>";
        expect(Mindmaps.findOne).toHaveBeenCalled();

        expect(returnedString).toBe(expectedString);
    });

    it('should call childrenRecurse in JSONConverter method if any of left/right of root has at least one child', function () {
        spyOn(Mindmaps,'findOne').and.returnValue({_id:"qRbTTPjHzfoGAmW3b",name:"testtxt", left:[], right:[]});
        spyOn(App.exportParser,"children_recurse");
        App.exportParser.children_recurse("qRbTTPjHzfoGAmW3b");
        expect(App.exportParser.children_recurse).toHaveBeenCalled();
    });
});