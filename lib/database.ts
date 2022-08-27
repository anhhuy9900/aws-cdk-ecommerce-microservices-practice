import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, BillingMode, Table, ITable } from 'aws-cdk-lib/aws-dynamodb';

export class SwnDatabase extends Construct {
    public readonly productTable: ITable;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Product DynamoDb Table Creation
        const productTable = new Table(this, 'ecommerce-practice-product-table', {
            partitionKey: {
              name: 'id',
              type: AttributeType.STRING
            },
            tableName: 'ecommerce-practice-product',
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST
          });
    }
}