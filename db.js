//INITIALIZES THE NPM PACKAGES USED//
var mysql = require('mysql');
var inquirer = require('inquirer');
var rainbow = require('ansi-rainbow');

//VARIABLES
var total = 0;

//INITIALIZES THE CONNECTION VARIABLE TO SYNC WITH A MYSQL DATABASE//
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "unikitty", //Your username//
    password: "glitterbomb", //Your password//
    database: "Glamazon"
})

//CREATES THE CONNECTION WITH THE SERVER AND MAKES THE TABLE UPON SUCCESSFUL CONNECTION//
connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
    }
    welcome();
    makeTable();
})

//FUNCTION TO GRAB THE PRODUCTS TABLE FROM THE DATABASE AND PRINT RESULTS TO CONSOLE//
var welcome = function(){
    console.log(rainbow.r("°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸"));
    console.log("");
    console.log('Welcome to Glamazon!');
    console.log("Your one stop cosplay shop for looks that pop");
    console.log("");
    console.log(rainbow.r("°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸"));
    console.log("");
}
var makeTable = function() {
    //SELECTS ALL OF THE DATA FROM THE MYSQL PRODUCTS TABLE - SELECT COMMAND!
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        //PRINTS THE TABLE TO THE CONSOLE WITH MINIMAL STYLING//
        var tab = "\t";
        console.log("ItemID\tProduct Name\tDepartment Name\tPrice\t# In Stock");
        console.log("---------------------------------------------------------");
        //FOR LOOP GOES THROUGH THE MYSQL TABLE AND PRINTS EACH INDIVIDUAL ROW ON A NEW LINE//
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].ItemID + tab + res[i].ProductName + tab + res[i].DepartmentName + tab + res[i].Price + tab + res[i].StockQuantity);
        }
        console.log("---------------------------------------------------------");
        //RUNS THE CUSTOMER'S PROMPTS AFTER CREATING THE TABLE. SENDS res SO THE promptCustomer FUNCTION IS ABLE TO SEARCH THROUGH THE DATA//
        promptCustomer(res);
    });
};

//FUNCTION CONTAINING ALL CUSTOMER PROMPTS//
var promptCustomer = function(res) {
        //PROMPTS USER FOR WHAT THEY WOULD LIKE TO PURCHASE//
        inquirer.prompt([{
            type: 'input',
            name: 'choice',
            message: 'What would you like to purchase?'
        }]).then(function(val) {
            //console.log(val.choice);

                //SET THE VAR correct TO FALSE SO AS TO MAKE SURE THE USER INPUTS A VALID PRODUCT NAME//
                var correct = false;
                //LOOPS THROUGH THE MYSQL TABLE TO CHECK THAT THE PRODUCT THEY WANTED EXISTS//
                for (var i = 0; i < res.length; i++) {                      
                  //1. TODO: IF THE PRODUCT EXISTS, SET correct = true and ASK THE USER TO SEE HOW MANY OF THE PRODUCT THEY WOULD LIKE TO BUY//
                  connection.query("SELECT * FROM products WHERE ?", [{
                              ProductName: val.choice
                            }], function(err, res) {
                                var price = res[i].Price;

                  
                   if (res.length < 1){
                    console.log("We're sorry, your product was not found. Please try again");
                     //console.log(res);
                  //console.log(val.choice);
                    makeTable();
                  }

                  else {
                    var product = val.choice
                    
                    correct = true;

                    inquirer.prompt([{
                        type: 'input',
                        name: 'quantity',
                        message: 'How many would you like to purchase?',
                        validate: function(value) {
                            if ((isNaN(value)) == false){
                                return true;
                            }
                            return "Please enter a number.";
                        }
                    }]).then(function(qty) {
                    //2. TODO: CHECK TO SEE IF THE AMOUNT REQUESTED IS LESS THAN THE AMOUNT THAT IS AVAILABLE//  
                        connection.query("SELECT StockQuantity FROM products WHERE ?", [{
                              ProductName: product
                            }], function(err, res) {
                                //console.log(res[0]);
                                if (res[0].StockQuantity == 0){
                                    console.log("We're sorry, your chosen product is out of stock. Please select a different item");
                                    correct = false
                                    makeTable();
                                } else {
                                    var stock = res[0].StockQuantity - qty.quantity;
                                    
                                    console.log(price);
                                     total = total + (price * qty.quantity);
                                    //console.log(stock);
                            //3. TODO: UPDATE THE MYSQL TO REDUCE THE StockQuanaity by the THE AMOUNT REQUESTED  - UPDATE COMMAND!
                                    connection.query("UPDATE products SET ? WHERE ?", [{
                                      quantity: stock
                                    },{
                                      ProductName: product
                                    }], function(err, res) {
                                      console.log("Quantity " + qty.quantity +" of " + product + " added to cart" );
                                      console.log("Your cost for this order is $" + total);
                                      console.log("");
                                      console.log(rainbow.r("°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸,ø¤º°`°º¤ø,¸°º¤ø,¸¸,ø¤º°`°º¤ø,¸,ø¤°º¤ø,¸¸"));
                                      console.log("");
                  //4. TODO: SHOW THE TABLE again by calling the function that makes the table

                     inquirer.prompt([ {
                        type: "confirm",
                        message: "Would you like to continue shopping?",
                        name: "confirm",
                        default: true

                      }]).then(function(val) {
                        //console.log(val);
                        if (val.confirm == true) {
                            makeTable();
                        } else {
                        console.log("Your order total is $" + total);    
                        console.log("Thank you for shopping at Glamazon! Have a fabulous day!");
                        process.exit();
                    }
            
                    }); 
                                    });
                                   
                                }
                           
                            });

                    });
                    
                }
                    });
                  

                 

               
                 

                  

                      return;
                }

                //IF THE PRODUCT REQUESTED DOES NOT EXIST, RESTARTS PROMPT//
                if (i == res.length && correct == false) {
                    promptCustomer(res);
                }
            });
}

