import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SwnApiGateway } from './api-gateway';
import { SwnDatabase } from './database';
import { SwnMicroservices } from './microservice';

export class AwsEcommerceMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Init Database
    const database = new SwnDatabase(this, 'Database');

    const microservices = new SwnMicroservices(this, 'Microservices', {
      productTable: database.productTable
    });

    const apiGateWay = new SwnApiGateway(this, 'ApiGateway', {
      productMicroservice: microservices.productMicroservice
    })
  }
}
