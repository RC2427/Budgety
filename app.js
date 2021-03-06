// BUDGET CONTROLLER
var budgetController = (function () {

    var expense = function (id, value, description) {
        this.id = id;
        this.value = value;
        this.description = description;
        this.Percentage = -1;
    };

    expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.Percentage = Math.round( (this.value / totalIncome) * 100);
        }
        else{
            this.Percentage = -1;
        }
    };

    expense.prototype.getPercentage = function(){
        return this.Percentage;
    };

    var income = function (id, value, description) {
        this.id = id;
        this.value = value;
        this.description = description;
    };

    //Total Inc and Exp calculation
    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (curr) {

            sum = sum + curr.value;
        });

        data.total_of_expinc[type] = sum;
    };

    var data = {

        allItems: {
            exp: [],
            inc: []
        },

        total_of_expinc: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        Percentage: -1
    };

    return {
        addItem: function (type, description, value) {
            var newItem, ID;

            //[1 2 3 4 5] next id should be 6
            //[1 2 4 7 9] if items are deleted then ID should be last items ID + 1


            //Checking for first item
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0
            }

            //Creating Item
            if (type === 'exp') {
                newItem = new expense(ID, value, description);
            }
            else if (type === 'inc') {
                newItem = new income(ID, value, description);
            }

            //Adding item to array
            data.allItems[type].push(newItem);

            return newItem
        },

        calculateBudget: function () {

            // Total Income An Expense
            calculateTotal('exp');
            calculateTotal('inc');

            // Budget Calcuation : Income - Expense
            data.budget = data.total_of_expinc.inc - data.total_of_expinc.exp;

            //Percentage Calculation
            if (data.total_of_expinc.inc > 0) {
                data.Percentage = Math.round((data.total_of_expinc.exp / data.total_of_expinc.inc) * 100);
            }
            else {
                data.Percentage = -1;
            }


        },

        calculatePercentage: function(){
            
            data.allItems.exp.forEach(function(curr){
                curr.calcPercentage(data.total_of_expinc.inc);
            });
        },

        getFinalpercentage: function(){
            var allPercentage = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });

            return allPercentage;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totexp: data.total_of_expinc.exp,
                totinc: data.total_of_expinc.inc,
                Percentage: data.Percentage
            }
        },

        deleteItem: function (type, id) {

            console.log(type + " " + id)
            var ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function () {
            console.log(data);
        }
    }

})();

// UI CONTROLLER
var UIController = (function () {

    var DOMStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        expPercentLabel: '.budget__expenses--percentage',
        incPercentLabel: '.budget__income--percentage',
        expPercentagelistLabel : '.item__percentage ',
        dateLabel : '.budget__title--month',
        container: '.container'
    };

    var formatNumbers = function(num,type){
        var numSplit;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        intPart = numSplit[0];
        console.log(intPart.length)
        if (intPart.length > 3) {
            intPart = intPart.substr(0, intPart.length - 3) + ',' + intPart.substr(intPart.length - 3, 3); //input 23510, output 23,510
        }

        decimal = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + intPart + '.' + decimal;
    };

    return {

        //Getting Input From UI elements
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDesc).value,
                inputValue: parseFloat(document.querySelector(DOMStrings.inputVal).value),
            };
        },

        //Adding items to UI's list
        addListitem: function (obj, type) {
            var html, newHtml, element;

            //Setting up HTML Strings
            if (type === 'exp') {

                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%inputValue%</div ><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div ></div>';
            }
            else if (type === 'inc') {

                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%inputValue%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replacing default html value with input value
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%inputValue%', formatNumbers(obj.value, type));

            //Inserting HTML 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        //Clearing Fields
        clearFields: function () {
            var fields, arrFields;

            fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputVal)
            
            //Converting list to array 
            arrFields = Array.prototype.slice.call(fields);
            arrFields.forEach(function (curr, index, array) {
                curr.value = "";
            });

            //Setting Focus back to Description
            arrFields[0].focus();
        },

        //Display's Budget On UI
        DisplayBudget: function (obj) {
            var budgetType;

            obj.budget > 0 ? budgetType = 'inc' : budgetType = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budget, budgetType);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumbers(obj.totinc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumbers(obj.totexp, 'exp');


            if (obj.Percentage > 0) {
                document.querySelector(DOMStrings.expPercentLabel).textContent = obj.Percentage + "%";
            }
            else {
                document.querySelector(DOMStrings.expPercentLabel).textContent = "--";
            }
        },

        displayExpPerc: function(Percentages){

            var fields = document.querySelectorAll(DOMStrings.expPercentagelistLabel);

            var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            } 
            
            nodeListForEach(fields, function(current, index) {
                
                if (Percentages[index] > 0) {
                    current.textContent = Percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        displayDate : function(){

            var now, year, months, currMonth;

            now = new Date();

            year = now.getFullYear();

            months = ['January', 'February', 'March' , 'April', 'May', 'June' ,'July', 'August', 'September', 'October', 'November', 'Decemeber'];

            currMonth = now.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent = months[currMonth] + ' ' + year;

        },

        // Delete's element from UI's List
        deletedListitem: function (selectorID) {
            var parentEl;
            parentEl = document.getElementById(selectorID);
            parentEl.parentNode.removeChild(parentEl);
        },

        getDomStrings: function () {
            return DOMStrings;
        }
    };

})();

// APP CONTROLLER
var appController = (function (budgetCtrl, UICtrl) {

    var setUpEventListeners = function () {
        var DOM = UICtrl.getDomStrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAdditem);

        //Adding event For Enter Key
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAdditem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', deleteEvent);
    };

    var updateBudget = function () {
        var budget;
        console.log('Calculating budget');

        // Calculate the Budget
        budgetCtrl.calculateBudget();

        // Return Budget
        budget = budgetCtrl.getBudget();

        // Display the Budget on the UI
        UICtrl.DisplayBudget(budget);
    };

    var updatePercentages = function(){

        // Calculating Percentages
        budgetCtrl.calculatePercentage();

        //Read Percentages from UI
        var expPercentages = budgetCtrl.getFinalpercentage();

        //Update Percentages
        UICtrl.displayExpPerc(expPercentages);
    };

    // Adding item To UI and Calclating Budget
    var ctrlAdditem = function () {
        var input, newItem;

        //Getting Input From UI
        input = UICtrl.getInput();

        if (input.description !== "" && input.inputValue > 0 && !isNaN(input.inputValue)) {

            //Adding Data To DS and creating new items
            newItem = budgetCtrl.addItem(input.type, input.description, input.inputValue);

            //Adding Item To The UI
            UICtrl.addListitem(newItem, input.type);

            //Clearing Fields
            UICtrl.clearFields();

            //Displaying And Updating Budget
            updateBudget();
            updatePercentages();
        }
    };

    // Deleting item from UI'list
    var deleteEvent = function (event) {

        var itemID, type, splitID, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Deleteing item form DS
            budgetCtrl.deleteItem(type, ID)

            //Deleting item From UI
            UICtrl.deletedListitem(itemID);

            //Updtaing UI
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function () {

            console.log("Application Has Started");
            UICtrl.displayDate();
            UICtrl.DisplayBudget({
                budget: 0,
                totexp: 0,
                totinc: 0,
                Percentage: -1
            })
            setUpEventListeners();
        }
    };

})(budgetController, UIController);

//initialising Events and Data
appController.init();
