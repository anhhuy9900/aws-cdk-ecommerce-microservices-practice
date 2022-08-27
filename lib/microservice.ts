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
}

export class SwnMicroservices extends Construct {
  public readonly productMicroservice: NodejsFunction;

  constructor(scope: Construct, id: string, props: SwnMicroservicesProps) {
    super(scope, id);

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        PRIMARY_KEY: "id",
        DYNAMODB_TABLE_NAME: props.productTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
    };

    // Product microservices lambda
    const productFunction = new NodejsFunction(
      this,
      "ecommerce-practice-productLambdaFunction",
      {
        entry: join(__dirname, `/../src/product/index.ts`),
        ...nodeJsFunctionProps,
      }
    );

    // Allow access database
    props.productTable.grantReadWriteData(productFunction);

    this.productMicroservice = productFunction;
  }
}