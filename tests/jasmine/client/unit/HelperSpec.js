describe('App.DirectionToggler', function () {
  it("should change current direction ", function () {
    var directionToggler = App.DirectionToggler.getInstance();
    directionToggler.changeDirection();
    expect(directionToggler.getCurrentDirection()).toBe("left");

    directionToggler.changeDirection();
    expect(directionToggler.getCurrentDirection()).toBe("right");
  });
});