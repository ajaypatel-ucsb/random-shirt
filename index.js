require("dotenv").config();
const express = require("express");
const axios = require("axios");
const inventoryData = require("./inventory.json");
const app = express();
const port = process.env.PORT || "8000";
const jquery = require("jquery");
const { Client, Config, CheckoutAPI } = require("@adyen/api-library");


// import body parser module to parse json request body
const { json } = require("body-parser");

let state = null;
// import Credentials from environment variables
const {
  env: { ADYEN_API_KEY },
} = process;
// generate random integer to pick shirt index from inventory
// started with individual variables for shirtId and array.length but refactored to simplify the code and make it dynamic for changes in inventory items
// dynamically populate array length [index] "max" based on number of items in the inventory file and generate a random index to select shirt
function getRandomShirt(min, max) {
  min = Math.ceil(0);
  max = Math.floor(inventoryData.products.length - 1);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// select shirt details for randomly generate shirt index using result result of getRandomShirt function

function shirt() {return inventoryData.products[getRandomShirt()];}

// Create Adyen API Client instance
const client = new Client({
  apiKey: ADYEN_API_KEY,
  environment: "TEST",
});
// Configure Adyen Client
const config = new Config();
config.apiKey = ADYEN_API_KEY;
config.merchantAccount = "TestAccountNY";
client.setEnvironment("TEST");
// Create new Checkout API Instance
const checkout = new CheckoutAPI(client);
/**
 * Routes Definitions
 */
// Set pug view
app.set("view engine", "pug");
// Set path to serve static files
app.use(express.static("public"));

// add parser middleware to parse json requests
app.use(json());


//generate random shirt function
/**
 * GET /
 * Returns random shirt to front end
 */


app.get("/", (req, res) => {
  let s = shirt();
  res.render("index", {
    name: s.productName,
    image: s.imageURL,
    price: s.displayPrice,
  });
});
/**
 * GET /checkout
 * ??
 */
app.get("/checkout", (req, res) => {
  let s = shirt();
  res.render("checkout", {
    name: s.productName,
    image: s.imageURL,
    price: s.displayPrice,
  });
});



/**
 * GET /payment-config
 *
 * Returns payment configuration for Adyen Client lib
 */
app.get("/payment-config", (req, res) => {
  let s = shirt();
  // Asynchronously call payment methods API
  // Api call completes first
  return (
    checkout
      .paymentMethods({
        amount: {
          currency: "USD",
          value: s.price,
        },
        countryCode: "US",
        shopperLocale: "en-US",
        channel: "Web",
        merchantAccount: config.merchantAccount,
      })
      //THEN tell the server to return a json response with the config
      .then((config) => res.json(config))
      // CATCH any errors that occur in the API call
      .catch((err) => {
        console.log("ERROR:", err);
      })
  );
});


//create /payment and /payment-details endpoint for server to client
//
app.post("/payment", (req, res) => {
  let s = shirt();
  //generate unique orderNumber
  let orderNumber = Date.now();
  // get payment method from req.body
  const {
    body: { paymentMethod },
  } = req;

  return (
    checkout

      // calling payments vs checkout as a function
      .payments({
        amount: {
          currency: "USD",
          value: s.price,
        },
        reference: orderNumber,
        paymentMethod: paymentMethod,
        returnUrl: "http://localhost:8000/checkout",
        merchantAccount: config.merchantAccount,
      })
      .then((config) => res.json(config))
      .catch((err) => {
        console.log("ERROR:", err);
      })
  );
});

app.post("/payment-details", (req, res) => {
  let s = shirt();
  // get payment method from req.body
  const {
    body: { paymentMethod },
  } = req;

  return (
    checkout

      // calling payments vs checkout as a function
      .payments({
        amount: {
          currency: "USD",
          value: s.price,
        },
        reference: orderNumber,
        paymentMethod: paymentMethod,
        returnUrl: "http://localhost:8000/checkout",
        merchantAccount: config.merchantAccount,
      })
      .then((config) => res.json(config))
      .catch((err) => {
        console.log("ERROR:", err);
      })
  );
});

/**
 * Server Activation
 */
// Binds server to given PORT - good idea to base this on an environment variable for deployment purposes
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}...`);
  //console.log(shirt.productName);
  //console.log(shirt);
  // paymentMethodsResponse.then(res => {
  //   console.log('checkoutMethods:', res);
  //   console.log('checkoutConfigurations:',configuration);
  //   //console.log('adyenCheckout:', adyenCheckout);
  // })
});
