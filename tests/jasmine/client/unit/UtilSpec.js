describe('util.wrapString', function () {
  it("should be able to split 'Hi there' with maxChar as 2 with arraylength of 2", function () {
    var result = "Hi there".wrapString(2);
    expect(result.length).toBe(3);
    expect(result[0]).toBe('Hi');
    expect(result[1]).toBe(' ');
    expect(result[2]).toBe('there');
  });

  it("should be able to split 'Hi Hi Hi' with maxChar as 2 with arraylength of 3", function () {
    var strArray = "Hi Hi Hi".wrapString(2);
    expect(strArray.length).toBe(5);
  });

  it("should be able to split 'Hi Hi Hi' with maxChar as 5 with arraylength of 2", function () {
    var strArray = "Hi Hi Hi".wrapString(5);
    expect(strArray.length).toBe(2);
  });


  it("should be able to split 'big text'", function () {
    var node = 'The first time the callback is called, previousValue and currentValue can be one of two values. If initialValue is provided in the call to reduce, then previousValue will be equal to initialValue and currentValue will be equal to the first value in the array';
    var result = ['The first time the callback is called, previousValue and currentValue can be one of two values.',
      ' If initialValue is provided in the call to reduce, then previousValue will be equal to ',
      'initialValue and currentValue will be equal to the first value in the array'];
    var strArray = node.wrapString(95);

    expect(strArray.length).toBe(3);
    expect(result[0]).toBe(strArray[0]);
    expect(result[1]).toBe(strArray[1]);
    expect(result[2]).toBe(strArray[2]);
  });

  it("should be able to split 'Traveltimeistoday' with maxChar as 3 with arraylength of 1", function () {
    var input = "Traveltimeistoday";
    var strArray = input.wrapString(3);
    expect(strArray.length).toBe(1);
    expect(input).toBe(strArray[0]);
  });

  it("should be able to split 'Travel time ' with  as 'Travel time' and ' '", function () {
    var strArray = "Travel time ".wrapString(11);
    expect(strArray[0]).toBe("Travel time");
    expect(strArray[1]).toBe(" ");
  });

  it("should be able to split 'Travel  time ' with as 'Travel  ' and 'time '", function () {
    var travel = 'Travel  ',
      time = 'time ',
      text = travel + time,
      strArray = text.wrapString(11);
    expect(strArray[0]).toBe(travel);
    expect(strArray[1].length).toBe(time.length);
  });

  it("should be able to wrap 'a    b' to 'a ' and ' b' with wrapLength as 2", function () {
    var firstPart = "a ",
      secondPart = " b",
      result = (firstPart + secondPart).wrapString(2);

    expect(result.length).toBe(2);
    expect(result[0]).toBe(firstPart);
    expect(result[1]).toBe(secondPart);
  });
});