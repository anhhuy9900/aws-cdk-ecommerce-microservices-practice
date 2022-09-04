import { PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { ebClient } from "./eventBridgeClient";
import getBasket from "./get";
import deleteBasket from "./delete";

export default async (event: any) => {
  console.log(`checkoutBasket function. event : "${event}"`);
  try {
    // expected request payload : { userName : swn, attributes[firstName, lastName, email ..]
    const checkoutRequest = JSON.parse(event.body);
    if (checkoutRequest == null || checkoutRequest.userName == null) {
      throw new Error(
        `userName should exist in checkoutRequest: "${checkoutRequest}"`
      );
    }

    // 1- Get existing basket with items
    const basket = await getBasket(checkoutRequest.userName);

    // 2- create an event json object with basket items,
    // calculate total price, prepare order create json data to send ordering ms
    const checkoutPayload = prepareOrderPayload(checkoutRequest, basket);

    // 3- publish an event to event bridge - this will subscribe by order microservice and start ordering process.
    const publishedEvent = await publishCheckoutBasketEvent(checkoutPayload);

    // 4- remove existing basket
    await deleteBasket(checkoutRequest.userName);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const prepareOrderPayload = (
  checkoutRequest: { totalPrice: number },
  basket: Record<string, any> | null
) => {
  console.log("prepareOrderPayload");

  // prepare order payload -> calculate totalprice and combine checkoutRequest and basket items
  // aggregate and enrich request and basket data in order to create order payload
  try {
    if (basket == null || basket.items == null) {
      throw new Error(`basket should exist in items: "${basket}"`);
    }

    // calculate totalPrice
    let totalPrice = 0;
    basket.items.forEach(
      (item: { price: number }) => (totalPrice = totalPrice + item.price)
    );
    checkoutRequest.totalPrice = totalPrice;
    console.log(checkoutRequest);

    // copies all properties from basket into checkoutRequest
    Object.assign(checkoutRequest, basket);
    console.log("Success prepareOrderPayload, orderPayload:", checkoutRequest);
    return checkoutRequest;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const publishCheckoutBasketEvent = async (checkoutPayload: {
  totalPrice: number;
}) => {
  console.log("publishCheckoutBasketEvent with payload :", checkoutPayload);
  try {
    // event bridge parameters for setting event to target system
    const params = {
      Entries: [
        {
          Source: process.env.EVENT_SOURCE,
          Detail: JSON.stringify(checkoutPayload),
          DetailType: process.env.EVENT_DETAILTYPE,
          Resources: [],
          EventBusName: process.env.EVENT_BUSNAME,
        },
      ],
    };

    const data = await ebClient.send(new PutEventsCommand(params));

    console.log("Success, event sent; requestID:", data);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
