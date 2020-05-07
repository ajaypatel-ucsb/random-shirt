//
//origin key must be unique per hostoriginKey = null
//
if (location.host.startsWith('localhost')) {
  originKey = "pub.v2.8115650120946270.aHR0cDovL2xvY2FsaG9zdDo4MDAw.zkoVizqsv4uttIICWCxh7zQ8yon0QwaISV5QrztZYE4"
 } else {
  originKey = "pub.v2.8115650120946270.aHR0cHM6Ly9wb2xhci1zYW5kcy00OTI0Ni5oZXJva3VhcHAuY29t.8Sqv54GbgTTCSeXxGDdwy6W6kk8XCPIt_2trwYNkZbs"
 }


const configuration = {
  // Set to null to be replaced when we get the server response
  paymentMethodsResponse: null,
  originKey: originKey,
  locale: "en-US",
  environment: "test",
  onSubmit: (state, dropin) => {
    // Your function calling your server to make the `/payments` request
    makeAdyenCall(state.data, "/payment")
      .then((response) => {
        if (response.action) {
          // Drop-in handles the action object from the /payments response
          dropin.handleAction(response.action);
        } else {
          // Your function to show the final result to the shopper
          showFinalResult(response);
        }
      })
      .catch((error) => {
        throw Error(error);
      });
  },
  onAdditionalDetails: (state, dropin) => {
    // Your function calling your server to make a `/payments/details` request
    makeAdyenCall(state.data, "/payment-details")
      .then((response) => {
        if (response.action) {
          // Drop-in handles the action object from the /payments response
          dropin.handleAction(response.action);
        } else {
          // Your function to show the final result to the shopper
          showFinalResult(response);
        }
      })
      .catch((error) => {
        throw Error(error);
      });
  },

  //optional configuration for Cards
  paymentMethodsConfiguration: {
    card: {
      hasHolderName: true,
      holderNameRequired: true,
      enableStoreDetails: true,
      hideCVC: false,
      name: "Credit or debit card",
    },
  },
};

// helper function to POST to the server with a given endpoint and data
function makeAdyenCall(data, endpoint) {
  return fetch(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((c) => c.json())
    .catch(console.error);
}

// function called when the DOM loads
$(document).ready(function () {
  // Click handler for the buy button
  $("tfoot.buybtn").click(function () {
    // Call server: GET /payment-config
    fetch("/payment-config")
      // parse response into json
      .then((c) => c.json())
      // handle json output
      .then((methods) => {
        // add response to configuration
        configuration.paymentMethodsResponse = methods;
        // instantiate checkout portal
        const adyenCheckout = new AdyenCheckout(configuration);
        // mount checkout portal to DOM
        const dropin = adyenCheckout
          .create("dropin")
          .mount("#dropin-container");
      })
      .catch(console.error);
  });
});

function showFinalResult(res) {
  location += "checkout";
}
