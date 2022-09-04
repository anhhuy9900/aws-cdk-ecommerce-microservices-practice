import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, BillingMode, Table, ITable } from 'aws-cdk-lib/aws-dynamodb';

export class SwnDatabase extends Construct {
    public readonly productTable: ITable;
    public readonly basketTable: ITable;
    public readonly orderTable: ITable;

    constructor(scope: Construct, id: string) {
      super(scope, id);

      //product table
      this.productTable = this.createProductTable();
      //basket table
      this.basketTable = this.createBasketTable();
      //order table
      this.orderTable = this.createOrderTable();
    }

    private createProductTable() {
      // Product DynamoDb Table Creation
      const productTable = new Table(this, 'swn-commerce-practice-product-table', {
        partitionKey: {
          name: 'id',
          type: AttributeType.STRING
        },
        tableName: 'swn-commerce-practice-product',
        removalPolicy: RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST
      });
      return productTable;
    }

    private createBasketTable() {
      //Create basket table
      // basket : PK: userName -- items (SET-MAP object) 
      // item1 - { quantity - color - price - productId - productName }
      // item2 - { quantity - color - price - productId - productName }
      const basketTable = new Table(this, 'swn-commerce-practice-basket-table', {
        partitionKey: {
          name: 'userName',
          type: AttributeType.STRING,
        },
        tableName: 'swn-commerce-practice-basket',
        removalPolicy: RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST
      });
      return basketTable;
    }

    private createOrderTable() {
      // Create Order DynamoDb Table Creation
      // order : PK: userName - SK: orderDate -- totalPrice - firstName - lastName - email - address - paymentMethod - cardInfo
      const orderTable = new Table(this, 'swn-commerce-practice-order-table', {
        partitionKey: {
          name: 'userName',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'orderDate',
          type: AttributeType.STRING,
        },
        tableName: 'swn-commerce-practice-order',
        removalPolicy: RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST
      });
      return orderTable;
    }
}