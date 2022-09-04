import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from './ddbClient';

export default async(userName: string | string) => {
    console.log('getBasket -> username: ', userName);
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ userName: userName })
        };
        const { Item } = await ddbClient.send(new GetItemCommand(params));
        console.log(Item);
        return (Item) ? unmarshall(Item) : {};
    } catch(err) {
        console.error(err);
        throw err;
    }
}