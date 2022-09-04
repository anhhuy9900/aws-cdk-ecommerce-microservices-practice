import { marshall } from "@aws-sdk/util-dynamodb";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./ddbClient";
import { v4 as uuidv4 } from "uuid";

export default async (event: any) => {
  console.log(`createProduct function. event : "${event}"`);
  try {
    const productRequest = JSON.parse(event.body);
    // set productid
    const productId = uuidv4();
    productRequest.id = productId;

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(productRequest || {}),
    };

    const createResult = await ddbClient.send(new PutItemCommand(params));

    console.log(createResult);
    return createResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
