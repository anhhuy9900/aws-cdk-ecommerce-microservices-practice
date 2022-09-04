import { marshall } from "@aws-sdk/util-dynamodb";
import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./ddbClient";

export default async(userName: string) => {
    console.log(`deleteBasket function. userName : "${userName}"`);

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ userName }),
    };

    const deleteResult = await ddbClient.send(new DeleteItemCommand(params));

    console.log(deleteResult);
    return deleteResult;
  } catch(e) {
    console.error(e);
    throw e;
  }
}