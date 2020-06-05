// BUDGET CONTROLLER
var budgetController = (function () {

    var expense = function (id, value, description) {
        this.id = id;
        this.value = value;
        this.description = description;
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
        container: '.container'
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
            newHtml = newHtml.replace('%inputValue%', obj.value);

            //Inserting HTML 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        //Clearing Fields
        clearFields: function () {
            var fields, arrFields;

            fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputVal)

            arrFields = Array.prototype.slice.call(fields);
            arrFields.forEach(function (curr, index, array) {
                curr.value = "";
            });

            arrFields[0].focus();
        },

        //Display's Budget On UI
        DisplayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totinc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totexp;


            if (obj.Percentage > 0) {
                document.querySelector(DOMStrings.expPercentLabel).textContent = obj.Percentage + "%";
            }
            else {
                document.querySelector(DOMStrings.expPercentLabel).textContent = "--";
            }
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

            //Updating UI
            updateBudget();
        }
    };

    return {
        init: function () {

            console.log("Application Has Started");
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
