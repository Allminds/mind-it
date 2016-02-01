Template.sharemap.helpers({
    permissions : function() {
        console.log("EDIT :" + App.editable);
        if(App.editable) {
            return [{name: 'r' , value: 'Read Only'} , {name: 'w' , value: 'Read-Write'}];
        }
        else {
            return [{name: 'r' , value: 'Read Only'}];
        }
    }
});
