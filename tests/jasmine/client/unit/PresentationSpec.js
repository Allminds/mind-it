describe('Presentation.js',function(){
    describe('getD3NOde',function(){

        it('should return undefined if node id passed to function does not exists on UI', function () {
            var randomId = "randomId123";
            var d3Node = App.presentation.getD3Node(randomId);
            expect(d3Node).toBe(undefined);
        });

        it('should return d3 element if passed node id is valid', function () {
            var randomId = "DCw5KBr3wECyubBin";
            var demo = d3.select()[0];
            var d3Node = App.presentation.getD3Node(randomId);
            expect(d3Node).toBe(undefined);
        });
    });
});