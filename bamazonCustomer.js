
var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require("cli-table");

// mysql connection settings
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

// Connect to mysql
connection.connect(function (err) {
    if(err) {
        throw err;
    }
    storeFront();
});


function storeFront() {
    // Display available items in a table
    console.log(" Welcome to my Bamazon! ")
    var table = new Table({
        head: ['Item ID', 'Product Name', 'Department', 'Price', 'Quantity']
    });

    // Get Items
    connection.query("SELECT * FROM `products`", function (err, res) {
        if(err) {
            throw err;
        }

        console.log(" ---- Available Products ---- ");

        for (var i = 0; i < res.length; i++) {
            var itemsArray = [];

            itemsArray.push(res[i].id);
            itemsArray.push(res[i].product_name);
            itemsArray.push(res[i].departament_name);
            itemsArray.push(res[i].price);
            itemsArray.push(res[i].stock_quantity);

            table.push(itemsArray);

            //console.log("ItemID: " + res[i].id + " | " + res[i].product_name + " | $" + res[i].price );

        }
        console.log(table.toString());

        // Get user input
        inquirer.prompt([
            {
                type: "input",
                message: "What is the Item ID of the product you would like to purchase?",
                name: "item_id"
            },
            {
                type: "input",
                message: "How many units would you like to purchase?",
                name: "quantity"
            }
        ]).then(function (answer) {
            var selectedItem = answer.item_id;
            var selectedQuantity = parseInt(answer.quantity);

            transactionComplete(selectedItem, selectedQuantity);
        })
    });
}

function transactionComplete(itemNumber, quantity) {
    connection.query("SELECT `stock_quantity`, `price` FROM `products` WHERE ?", [
        {
            id: itemNumber
        }
    ], function (err, res) {
        if (err) {
            throw err;
        }

        var currentQty = parseInt(res[0].stock_quantity);

        // Check stock_quantity
        if (currentQty < quantity) {
            console.log("Insufficient quantity! Come back soon, we are adding to our stock daily.");

            storeFront();

        } else {
            var newQty = currentQty - quantity;
            var purchasePrice = quantity * parseFloat(res[0].price);

            connection.query("UPDATE `products` SET `stock_quantity` = " + newQty + " WHERE ?", [
                {
                    id: itemNumber
                }
            ], function (err, res) {
                if (err) {
                    throw err;
                }

                console.log("Transaction sucessfully completed! Thank you for your purchase. Total cost: $" + purchasePrice);
                menu();

            })
        }
    })

}

// Prompt user of what would like to do next
function menu() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do next?",
            choices: ["Buy more items", "Quit"],
            name: "action"
        }
    ]).then(function (answer) {
        if(answer.action === "Quit") {
            connection.end();
            console.log("Thank you for visiting my store! Hope to see you back soon.")
        } else {
            storeFront();
        }

    })
}






