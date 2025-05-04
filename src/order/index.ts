import {
  PutItemCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient";

exports.handler = async (event: any) => {
  console.log("Order request: ", JSON.stringify(event, undefined, 2));

  // TODO - Catch and Process Async EventBridge Invocation and Sync API Gateway Invocation
  const eventType = event["detail-type"];

  if (eventType !== undefined) {
    // EventBridge Invocation
    await eventBridgeInvocation(event);
  } else {
    // API Gateway Invocation -- return sync response
    return await apiGatewayInvocation(event);
  }
};

const eventBridgeInvocation = async (event: any) => {
  console.log(`eventBridgeInvocation function. event : "${event}"`);

  // create order item into db
  await createOrder(event.detail);
};

const createOrder = async (basketCheckoutEvent: any) => {
  try {
    console.log(`createOrder function. event : "${basketCheckoutEvent}"`);

    // set orderDate for SK of order dynamodb
    const orderDate = new Date().toISOString();
    basketCheckoutEvent.orderDate = orderDate;
    console.log(basketCheckoutEvent);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(basketCheckoutEvent || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));
    console.log(createResult);
    return createResult;
  } catch (e) {
    console.error("createOrder - ERROR: ", e);
    throw e;
  }
};

const apiGatewayInvocation = async (event: any) => {
  // GET /order
  // GET /order/{userName}
  let body;

  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.pathParameters != null) {
          body = await getOrder(event);
        } else {
          body = await getAllOrders();
        }
        break;
      default:
        throw new Error(`Unsupported route: "${event.httpMethod}"`);
    }

    console.log("apiGatewayInvocation - body: ", body);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully finished operation: "${event.httpMethod}"`,
        body: body,
      }),
    };
  } catch (e: any) {
    console.error("apiGatewayInvocation - ERROR: ", e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to perform operation.",
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
};

const getOrder = async (event: any) => {
  console.log("getOrder");
  try {
    // expected request : xxx/order/swn?orderDate=timestamp
    const userName = event.pathParameters.userName;
    const orderDate = event.queryStringParameters.orderDate;

    const params = {
      KeyConditionExpression: "userName = :userName and orderDate = :orderDate",
      ExpressionAttributeValues: {
        ":userName": { S: userName },
        ":orderDate": { S: orderDate },
      },
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new QueryCommand(params));
    console.log("getOrder - Items: ", Items);

    return Items?.map((item) => unmarshall(item));
  } catch (e) {
    console.error("getOrder - ERROR: ", e);
    throw e;
  }
};

const getAllOrders = async () => {
  console.log("getAllOrders - INIT");
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));
    console.log("getAllOrders - Items: ", Items);

    return Items?.map((item) => (item ? unmarshall(item) : {}));
  } catch (e) {
    console.error("getAllOrders - ERROR: ", e);
    throw e;
  }
};
