import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
  productMicroservice: IFunction;
}

export class SwnApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
    super(scope, id);

    // Product microservices api gateway
    // root name = product

    // GET /product
    // POST /product

    // Single product with id parameter
    // GET /product/{id}
    // PUT /product/{id}
    // DELETE /product/{id}
    const apigw = new LambdaRestApi(this, "ecommerce-practice-product-api", {
      restApiName: "E-commerce Practice Product Service",
      handler: props.productMicroservice,
      proxy: false,
    });

    const products = apigw.root.addResource("product");
    products.addMethod("GET"); // GET /product
    products.addMethod("POST"); // POST /product

    const product = products.addResource("{id}"); // product/{id}
    product.addMethod("GET"); // GET /product/{id}
    product.addMethod("PUT"); // PUT /product/{id}
    product.addMethod("DELETE"); // DELETE /product/{id}
  }
}
