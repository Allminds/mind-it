describe('App.DirectionToggler', function () {
  it("should change current direction ", function () {
    App.DirectionToggler.changeDirection();
    expect(App.DirectionToggler.currentDir).toBe("left");

    App.DirectionToggler.changeDirection();
    expect(App.DirectionToggler.currentDir).toBe("right");
  });
});