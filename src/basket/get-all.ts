import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "./ddbClient";

export default async (event: any) => {
  console.log("getAllBaskets -> event: ", event);
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
    };

    const { Items } = await ddbClient.send(new ScanCommand(params));

    console.log(Items);
    return Items ? Items.map((item: any) => unmarshall(item)) : {};
  } catch (e) {
    console.error(e);
    throw e;
  }
};
