/* global describe */
/* global beforeEach */
/* global it */
/* global expect */
/* globals Player: false, Song: false */

describe('MindMapService', function () {
  var mindMapService;

  beforeEach(function () {
    mindMapService = new MindMapService();
  });
  describe("sayHello", function () {
    it('should be able to say Hello', function () {
      var name = 'bla',
        result = mindMapService.sayHello(name);
      expect(result).toEqual('Hello ' + name);

    });
  });
});
describe('SessionCounter', function () {
  describe("getCount", function () {
    it('should return count intial value', function () {
      var result = SessionCounter.getCount();
      expect(result).toEqual(0);
    });
  });
  describe("incrementCount", function () {
    it('should return count incremented by 1', function () {
      var initial = SessionCounter.getCount();
      SessionCounter.incrementCount();
      var result = SessionCounter.getCount();
      expect(result).toEqual(initial + 1);
    });
  });
});
