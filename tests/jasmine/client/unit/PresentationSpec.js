/**
 * Created by mahadev on 24/03/16.
 */
describe('Presentation.js',function(){
    describe('getD3NOde',function(){
    it('should return null if node id passed to function does not exists on UI',function(){
        var randomId = "randomId123";
        var d3Node = App.presentation.getD3Node(randomId);
        expect(d3Node.toBe(null));
    });
    });
});