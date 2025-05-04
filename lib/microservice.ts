import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface SwnMicroservicesProps {
  productTable: ITable;
  basketTable: ITable;
  orderTable: ITable;
}

export class SwnMicroservices extends Construct {
  public readonly productMicroservice: NodejsFunction;
  public readonly basketMicroservice: NodejsFunction;
  public readonly orderMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
    super(scope, id);

    // product microservices
    this.productMicroservice = this.createProductFunction(props.productTable);
    // basket microservices
    this.basketMicroservice = this.createBasketFunction(props.basketTable);
    // ordering Microservice
    this.orderMicroservice = this.createOrderFunction(props.orderTable);
  }

  private createProductFunction(productTable: ITable): NodejsFunction {
    const nodeJsFunctionProps = this.getFunctionProps(productTable, {
      PRIMARY_KEY: "id",
    })

    // Product microservices lambda
    const productFunction = new NodejsFunction(
      this,
      "ecommerce-practice-productLambdaFunction",
      {
        entry: join(__dirname, `/../src/product/index.ts`),
        ...nodeJsFunctionProps,
      }
    );

    // Allow access database for product service
    productTable.grantReadWriteData(productFunction);

    return productFunction;
  }

  private createBasketFunction(basketTable: ITable): NodejsFunction {
    const nodeJsFunctionProps = this.getFunctionProps(basketTable, {
      PRIMARY_KEY: "userName",
      EVENT_SOURCE: "com.swn.basket.checkoutbasket",
      EVENT_DETAILTYPE: "CheckoutBasket",
      EVENT_BUSNAME: "SwnEventBus"
    });

    // Basket microservices lambda
    const basketFunction = new NodejsFunction(
      this,
      "ecommerce-practice-basketLambdaFunction",
      {
        entry: join(__dirname, `/../src/basket/index.ts`),
        ...nodeJsFunctionProps,
      }
    );

    // Allow access database for basket service
    basketTable.grantReadWriteData(basketFunction);

    return basketFunction;
  }

  private createOrderFunction(orderTable: ITable): NodejsFunction {
    const nodeJsFunctionProps = this.getFunctionProps(orderTable, {
      PRIMARY_KEY: 'userName',
      SORT_KEY: 'orderDate',
    });
    
    // Order microservices lambda
    const orderFunction = new NodejsFunction(
      this,
      "ecommerce-practice-orderLambdaFunction",
      {
        entry: join(__dirname, `/../src/order/index.ts`),
        ...nodeJsFunctionProps,
      }
    );

    // Allow access database for order service
    orderTable.grantReadWriteData(orderFunction);

    return orderFunction;
  }

  private getFunctionProps(propTable: ITable, environment: object): NodejsFunctionProps {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        ...environment,
        DYNAMODB_TABLE_NAME: propTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
    };
    return nodeJsFunctionProps;
  }
}
