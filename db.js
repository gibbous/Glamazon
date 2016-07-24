//INITIALIZES THE NPM PACKAGES USED//
var mysql = require('mysql');
var inquirer = require('inquirer');

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
    makeTable();
})

//FUNCTION TO GRAB THE PRODUCTS TABLE FROM THE DATABASE AND PRINT RESULTS TO CONSOLE//
var makeTable = function() {
    //SELECTS ALL OF THE DATA FROM THE MYSQL PRODUCTS TABLE - SELECT COMMAND!
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        //PRINTS THE TABLE TO THE CONSOLE WITH MINIMAL STYLING//
        var tab = "\t";
        console.log("ItemID\tProduct Name\tDepartment Name\tPrice\t# In Stock");
        console.log("--------------------------------------------------------");
        //FOR LOOP GOES THROUGH THE MYSQL TABLE AND PRINTS EACH INDIVIDUAL ROW ON A NEW LINE//
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].ItemID + tab + res[i].ProductName + tab + res[i].DepartmentName + tab + res[i].Price + tab + res[i].StockQuantity);
        }
        console.log("--------------------------------------------------------");
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
            (console.log(val.choice));

                //SET THE VAR correct TO FALSE SO AS TO MAKE SURE THE USER INPUTS A VALID PRODUCT NAME//
                var correct = false;
                //LOOPS THROUGH THE MYSQL TABLE TO CHECK THAT THE PRODUCT THEY WANTED EXISTS//
                for (var i = 0; i < res.length; i++) {                      
                  //1. TODO: IF THE PRODUCT EXISTS, SET correct = true and ASK THE USER TO SEE HOW MANY OF THE PRODUCT THEY WOULD LIKE TO BUY//
                  connection.query("SELECT * FROM products WHERE ?", [{
                              ProductName: val.choice
                            }], function(err, res) {
                             
                            });

                  if (res != null){

                    var product = val.choice
                    console.log(product);
                    correct = true;


                    inquirer.prompt([{
                         type: 'input',
                        name: 'quantity',
                        message: 'How many would you like to purchase?',
                        validate: function(value) {
                            if ((isNaN(value)) == false){
                                return true;
                            }
                            return "ha ha, very funny - pick a number or go away";
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
                                    console.log(stock);

                                     //3. TODO: UPDATE THE MYSQL TO REDUCE THE StockQuanaity by the THE AMOUNT REQUESTED  - UPDATE COMMAND!
                                    connection.query("UPDATE products SET ? WHERE ?", [{
                                      quantity: stock
                                    },{
                                      ProductName: product
                                    }], function(err, res) {
                                      console.log(qty.quantity +" of " + product +"added to cart" );
                                    });
                                   
                                }
                             
                            });

                    });
                    
                }

               
                 

                  //4. TODO: SHOW THE TABLE again by calling the function that makes the table
                      return;
                }

                //IF THE PRODUCT REQUESTED DOES NOT EXIST, RESTARTS PROMPT//
                if (i == res.length && correct == false) {
                    promptCustomer(res);
                }
            });
}

