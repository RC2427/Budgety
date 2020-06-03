var budgetController = (function(){

})();

var UIController= (function(){

    var DOMStrings = {
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputVal : '.add__value',
        inputButton : '.add__btn'
    };

    return {
        getInput : function(){
            return{
                type : document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDesc).value,
                inputValue : document.querySelector(DOMStrings.inputVal).value,
            };
        },

        getDomStrings : function(){
            return DOMStrings;
        }
    };

})();

var appController = (function(budgetCtrl,UICtrl){

    var setUpEventListeners = function(){
        var DOM = UICtrl.getDomStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAdditem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAdditem();
            }
        });
    };

    var ctrlAdditem = function(){
        var input = UICtrl.getInput();
        console.log(input);
    };

    return {
        init : function(){
            console.log("Application Has Started");
            setUpEventListeners();
        }
    };

})(budgetController,UIController);

appController.init();

