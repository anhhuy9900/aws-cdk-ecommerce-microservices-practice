import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { SwnApiGateway } from "./api-gateway";
import { SwnDatabase } from "./database";
import { SwnMicroservices } from "./microservice";
import { SwnEventBus } from "./eventbus";
import { SwnQueue } from "./queue";

export class AwsEcommerceMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Init Database
    const database = new SwnDatabase(this, "Database");

    const microservices = new SwnMicroservices(this, "Microservices", {
      productTable: database.productTable,
      basketTable: database.basketTable,
      orderTable: database.orderTable,
    });

    const apiGateWay = new SwnApiGateway(this, "ApiGateway", {
      productMicroservice: microservices.productMicroservice,
      basketMicroservice: microservices.basketMicroservice,
      orderMicroservice: microservices.orderMicroservice,
    });

    const queue = new SwnQueue(this, "Queue", {
      consumer: microservices.orderMicroservice,
    });

    const eventbus = new SwnEventBus(this, "EventBus", {
      publisherFuntion: microservices.basketMicroservice,
      //targetFuntion: microservices.orderMicroservice,
      targetQueue: queue.orderQueue,
    });
  }
}
