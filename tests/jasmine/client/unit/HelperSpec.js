describe('application.directionToggler', function () {
  it("should change current direction ", function () {
    application.directionToggler.changeDirection();
    expect(application.directionToggler.currentDir).toBe("left");
    application.directionToggler.changeDirection();
    expect(application.directionToggler.currentDir).toBe("right");
  });
});