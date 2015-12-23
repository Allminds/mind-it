describe('create.helpers.helper.directionToggler', function () {
    it("should change current direction ", function () {
        application.currentDir = "right";
        application.directionToggler.changeDirection();
        expect(application.directionToggler.currentDir).toBe("left");
    });
});