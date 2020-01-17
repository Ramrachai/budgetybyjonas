//BUDGET CONTROLLER (MODEL-M)
var budgetController = (function() {
  // Expense function constructor
  var Expenses = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expenses.prototype.caclPercentage = function(totalIncome) {
    if (this.value > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expenses.prototype.getPercentage = function() {
    return this.percentage;
  };
  // Income function constructor
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var data = {
    items: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      let newItem, id;
      if (data.items[type].length == 0) {
        id = 0;
      } else {
        id = data.items[type][data.items[type].length - 1].id + 1;
      }
      if (type === "exp") {
        newItem = new Expenses(id, des, val);
      } else if (type === "inc") {
        newItem = new Income(id, des, val);
      }

      data.items[type].push(newItem);
      return newItem;
    },
    dataSet: function() {
      return data;
    },
    deleteItem: function(id, type) {
      var ids, index;
      ids = data.items[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);
      data.items[type].splice(index, 1);
      console.log("updated data: ", data);
    },
    calculateBudget: function() {
      // calculate total income or expense
      var incSum = 0;
      var expSum = 0;
      // sum all the values
      data.items.inc.forEach(function(current) {
        incSum = incSum + current.value;
      });
      data.items.exp.forEach(function(current) {
        expSum = expSum + current.value;
      });
      // set the sum value in the object
      data.totals.inc = incSum;
      data.totals.exp = expSum;

      // calculate budget : income - expense
      var budget = data.totals.inc - data.totals.exp;
      data.budget = budget;
      // calculate percentage : income/expense * 100
      if (data.totals.inc > 0) {
        var percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        data.percentage = percentage;
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      //cal calcPercentage function for each array
      data.items.exp.forEach(function(current) {
        current.caclPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPerc = data.items.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        totalExp: data.totals.exp,
        totalInc: data.totals.inc,
        budget: data.budget,
        percentage: data.percentage
      };
    }
  };
})();
// ************UI************************
//*************************************** */

// UI CONTROLLER (VIEW-V)
var uiController = (function() {
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    expenseLabel: ".budget__expenses--value",
    incomeLabel: ".budget__income--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    itemPercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumbers = function(numb, type) {
    var sign;
    /**
     * 25232  => + 25,232.00
     */
    numb = Math.abs(numb); // make always plus
    numb = numb.toFixed(2); // take only 2 decimal numbers
    numbSplit = numb.split("."); // split integer and decimal part
    // integer part
    var int = numbSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    } else {
      int = int;
    }
    // decimal part
    var decimal = numbSplit[1];
    // return final output + 25,232.00
    return (type === "exp" ? "-" : "+") + int + "." + decimal;
  };

  return {
    // return starts here
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    getDOMStrings: function() {
      return DOMStrings;
    },

    addlistItems: function(obj, type) {
      //1. create html stings
      var html, newHtml;
      if (type == "inc") {
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline"> </i> </button> </div> </div> </div>';
      } else if (type == "exp") {
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // 2. replace placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumbers(obj.value, type));

      //3. insert the html into DOM
      if (type == "inc") {
        document
          .querySelector(DOMStrings.incomeContainer)
          .insertAdjacentHTML("beforeend", newHtml);
      } else if (type == "exp") {
        document
          .querySelector(DOMStrings.expenseContainer)
          .insertAdjacentHTML("beforeend", newHtml);
      }
    },
    deleteListItem: function(id) {
      var element = document.getElementById(id);
      element.parentNode.removeChild(element);
    },

    clearField: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputDescription + " , " + DOMStrings.inputValue
      ); //it will return a node list . so convert Nodelist to array first
      var fieldsArr = Array.from(fields); // converting Nodelist to array
      //or
      var fieldArr = Array.prototype.slice.call(fields); //converting Nodelist to array;
      fieldArr.forEach((current, index, array) => {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    updateBudgetUI: function(obj) {
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(
        DOMStrings.budgetLabel
      ).textContent = formatNumbers(obj.budget, type);
      document.querySelector(
        DOMStrings.expenseLabel
      ).textContent = formatNumbers(obj.totalExp, "exp");
      document.querySelector(
        DOMStrings.incomeLabel
      ).textContent = formatNumbers(obj.totalInc, "inc");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "...";
      }
    },
    displayPercentages: function(percentages) {
      var field = document.querySelectorAll(DOMStrings.itemPercentageLabel);
      var fieldArr = Array.from(field);

      fieldArr.forEach(function(current, index, array) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
      // var nodelistForeach = function (field, )
    },
    displayDate: function() {
      var now, month, allMonth, year;
      now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
      allMonth = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = allMonth[month];
      document.querySelector(DOMStrings.dateLabel).textContent =
        month + " " + year;
    },
    typeChange: function() {
      console.log("type change ");
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      );
      var fieldArr = Array.from(fields);
      fieldArr.forEach(function(current, index, array) {
        current.classList.toggle("red-focus");
      });
      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    }
  }; // return finish here
})();

// *************controller*****************
//*************************************** */

//GLOBAL CONTROLLER (CONTROLLER -C)
var controller = (function(bgtCtrl, uiCtrl) {
  var updateBudget = function() {
    //5. Calcutate the budget
    bgtCtrl.calculateBudget();
    //6. Return the budget
    var budget = bgtCtrl.getBudget();
    //7. Display the result in UI
    console.log("budget", budget);
    uiCtrl.updateBudgetUI(budget);
  };

  var updatePercentage = function() {
    //1. calculate the percentage
    bgtCtrl.calculatePercentages();
    //2. read percentage from budget controller
    var percentages = bgtCtrl.getPercentages();
    //3. Update the UI
    uiCtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    // 1.Get the values from UI input.   location : uiController
    var input = uiCtrl.getInput();
    if (input.description !== "" && input.value > 0) {
      //2. Send it to budgetController
      var newitem = bgtCtrl.addItem(input.type, input.description, input.value);

      //3. show in UI (call the addListItems function to insert html in dom)
      uiCtrl.addlistItems(newitem, input.type);

      //4. clear input fields after submit
      uiCtrl.clearField();

      //5. calculate and update budget:
      updateBudget();

      //6. Update percentages of each item
      updatePercentage();

      console.log("dataset: ", bgtCtrl.dataSet());
    }
  }; // finish ctrlAddItem

  var ctrlDeleteItem = function(event) {
    console.log(
      "event target:",
      event.target.parentNode.parentNode.parentNode.parentNode.id
    );

    //1.get the element id
    var itemId, splitId, id, type;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitId = itemId.split("-");
      id = parseInt(splitId[1]);
      type = splitId[0];
      console.log("item id: ", id);
      console.log("item type : ", type);
    }

    console.log(itemId, splitId, id, type);

    //2.delete the value from data relavent with id
    bgtCtrl.deleteItem(id, type);
    //3.delete item from UI
    uiCtrl.deleteListItem(itemId);
    //4. update total data and UI
    updateBudget();
    //5. update percentage of each item
    updatePercentage();
  };
  var setupEventListeners = function() {
    var DOM = uiCtrl.getDOMStrings();
    // add items when Submit button is clicked
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    // add items when Enter key is pressed
    document.addEventListener("keypress", function(e) {
      if (e.keyCode == 13) {
        ctrlAddItem();
      }
    });
    // delete items when delete button is clicked
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    //change color when type changes
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", uiCtrl.typeChange);
  };

  return {
    init: function() {
      uiCtrl.updateBudgetUI({
        totalExp: 0,
        totalInc: 0,
        budget: 0,
        percentage: -1
      });
      setupEventListeners();
      uiCtrl.displayDate();
    }
  };
})(budgetController, uiController);

controller.init();

// var data = {
//   items: {
//     exp: [
//       {
//         id: 4230,
//         description: "id is zero",
//         value: 20
//       },
//       {
//         id: 1231,
//         description: "id is one",
//         value: 21
//       },
//       {
//         id: 1312,
//         description: "id is two",
//         value: 22
//       }
//     ],
//     inc: []
//   },
//   totals: {
//     exp: 0,
//     inc: 0
//   }
// };
// console.log("data:", data);

// var ids = data.items.exp.map(current => {
//   return current.id;
// });
// var index = ids.indexOf(1231);
// data.items.exp.splice(index, 1);
// console.log("ids: ", ids);
// console.log("index: ", index);
// console.log("Updated data: ", data);
/* 
dom traversing: 
node properties for navigation -> 
1.parentNode
2.childNodes[nodenumber]
3.firstChild
4.lastChild
5.nextSibling
6.previousSibling

DOM root nodes: 
1. document.body
2.document.documentElement
*/
