describe('map.findOne', function () {

  var data = {
    name: 'root',
    children: [
      {
        name: '1',
        children: [{name: '1.1'}, {name: '1.2'}]
      },
      {
        name: '2',
        children: [
          {name: '2.1'},
          {
            name: '2.2',
            children: [{name: '2.2.1'}, {name: '2.2.2'}]
          }]
      },
      {name: '3'},
      {name: '4'}
    ]
  };
  it('Should find out node level 1', function () {
    var result = map.findOne(data, function (x) {
      return x.name == '2'
    });
    expect(result.name).toBe('2');
  });

  it('Should find out node level 2', function () {
    var result = map.findOne(data, function (x) {
      return x.name == '2.2'
    });
    expect(result.name).toBe('2.2');
  });

  it('Should find out node level 3', function () {
    var result = map.findOne(data, function (x) {
      return x.name == '2.2.1'
    });
    expect(result.name).toBe('2.2.1');
  });

  it('Should return null if not found', function () {
    var result = map.findOne(data, function (x) {
      return x.name == '2.2.1asd'
    });
    expect(result).toBe(null);
  })
});

