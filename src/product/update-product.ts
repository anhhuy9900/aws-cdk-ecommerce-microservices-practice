import { marshall } from "@aws-sdk/util-dynamodb";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./ddbClient";

export default async (event: any) => {
  console.log(`updateProduct function. event : "${event}"`);
  try {
    const requestBody = JSON.parse(event.body);
    const objKeys = Object.keys(requestBody);
    console.log(
      `updateProduct function. requestBody : "${requestBody}", objKeys: "${objKeys}"`
    );

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: requestBody[key],
          }),
          {}
        )
      ),
    };

    const updateResult = await ddbClient.send(new UpdateItemCommand(params));

    console.log(updateResult);
    return updateResult;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
