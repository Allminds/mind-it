/* global Session */
/* global SessionCounter */
/* global MindMapService */

MindMapService = function MindMapService() {};

MindMapService.prototype.sayHello = function(name) {
  return 'Hello ' + name;
};
SessionCounter = {
  getCount :function(){
    
    var count =  Session.get('counter');
    if(!count){
      Session.setDefault('counter', 0);
      return 0;
    }
    return count;
  },
  
  incrementCount:function(){
    Session.set('counter', SessionCounter.getCount('counter') + 1);
  }
}