require("dotenv").config();
const express = require("express");
const axios = require("axios");
const inventoryData = require("./inventory.json");
const app = express();
const port = process.env.PORT || "8000";
const jquery = require("jquery");
const { Client, Config, CheckoutAPI } = require("@adyen/api-library");

// import api key from .env file
const {
  env: { ADYEN_API_KEY },
} = process;

//
// generate random integer to pick shirt index from inventory
//started with individual variables for shirtId and array.length but refactored to simplify the code and make it dynamic for changes in inventory items
//

//dynamically populate array length [index] "max" based on number of items in the inventory file and generate a random index to select shirt
function getRandomShirt(min, max) {
  min = Math.ceil(0);
  max = Math.floor(inventoryData.products.length - 1);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//select shirt details for randomly generate shirt index using result result of getRandomShirt function
let shirt = inventoryData.products[getRandomShirt()];

const client = new Client({
  apiKey: ADYEN_API_KEY,
  environment: "TEST",
});

const config = new Config();
config.apiKey = ADYEN_API_KEY;
config.merchantAccount = "TestAccountNY";
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

// putting this in the route itself
/* const getPaymentMethods = () =>
  checkout
    .paymentMethods({
      amount: {
        currency: "USD",
        value: shirt.price,
      },
      countryCode: "US",
      shopperLocale: "en-US",
      channel: "Web",
      merchantAccount: config.merchantAccount,
    })
    .then((res) => {
      cb(res);
    })
    .catch((err) => {
      console.log("ERROR:", err);
    });
 */

//was getting a paymentMethodsResponse not defined error so I modified the name incase there are any dependancies in the library //modifed const above instead
//var paymentMethodsResponse = paymentsResponse;

//const adyenCheckout = new CheckoutAPI(configuration);
//const dropin = checkout.create('dropin').mount('#dropin-container');

/**
 * Routes Definitions
 */

app.set("view engine", "pug");
app.use(express.static("public"));

//pass shirt data to PUG for rendering. PUG doesn't handle objects so I had to break out each attribute to display into individual variables
app.get("/", (req, res) => {
  res.render("index", {
    name: shirt.productName,
    image: shirt.imageURL,
    price: shirt.displayPrice,
  });
});

app.get("/checkout", (req, res) => {
  res.render("checkout", {
    name: shirt.productName,
    image: shirt.imageURL,
    price: shirt.displayPrice,
  });
});

// route to handle retrieval of payment configs
app.get("/payment-config", (req, res) => {
  return checkout
    .paymentMethods({
      amount: {
        currency: "USD",
        value: shirt.price,
      },
      countryCode: "US",
      shopperLocale: "en-US",
      channel: "Web",
      merchantAccount: config.merchantAccount,
    })
    .then((config) => res.json(config))
    .catch((err) => {
      console.log("ERROR:", err);
    });
});
/**
 * Server Activation
 */

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}...`);
  console.log(shirt.productName);
  console.log(shirt);
  // paymentMethodsResponse.then(res => {
  //   console.log('checkoutMethods:', res);
  //   console.log('checkoutConfigurations:',configuration);
  //   //console.log('adyenCheckout:', adyenCheckout);

  // })
});
