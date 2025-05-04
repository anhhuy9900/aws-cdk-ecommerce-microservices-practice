import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
  productMicroservice: IFunction;
  basketMicroservice: IFunction;
  orderMicroservice: IFunction;
}

export class SwnApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
    super(scope, id);

    // Product api gateway
    this.createProductApi(props.productMicroservice);

    // Basket api gateway
    this.createBasketApi(props.basketMicroservice);

    // Order api gateway
    this.createOrderApi(props.orderMicroservice);
    
  }

  private createProductApi(instanceMicroservice: IFunction) {
    // Product microservices api gateway
    // root name = product
    const apigw = new LambdaRestApi(this, "ecommerce-practice-product-api", {
      restApiName: "E-commerce Practice Product Service",
      handler: instanceMicroservice,
      proxy: false,
    });

    // GET /product
    // POST /product
    const products = apigw.root.addResource("product");
    products.addMethod("GET"); // GET /product
    products.addMethod("POST"); // POST /product

    // Single product with id parameter
    // GET /product/{id}
    // PUT /product/{id}
    // DELETE /product/{id}
    const product = products.addResource("{id}"); // product/{id}
    product.addMethod("GET"); // GET /product/{id}
    product.addMethod("PUT"); // PUT /product/{id}
    product.addMethod("DELETE"); // DELETE /product/{id}
  }

  private createBasketApi(instanceMicroservice: IFunction) {
    // Basket microservices api gateway
    // root name = basket
    const apigw = new LambdaRestApi(this, "ecommerce-practice-basket-api", {
      restApiName: "E-commerce Practice Basket Service",
      handler: instanceMicroservice,
      proxy: false,
    });

    const root = apigw.root.addResource('basket');
    root.addMethod('GET');  // GET /basket
    root.addMethod('POST');  // POST /basket

    const singleBasket = root.addResource('{userName}');
    singleBasket.addMethod('GET');  // GET /basket/{userName}
    singleBasket.addMethod('DELETE'); // DELETE /basket/{userName}

    const basketCheckout = root.addResource('checkout');
    basketCheckout.addMethod('POST'); // POST /basket/checkout
        // expected request payload : { userName : swn }
  }

  private createOrderApi(instanceMicroservice: IFunction) {
    // Order microservices api gateway
    // root name = product
    const apigw = new LambdaRestApi(this, "ecommerce-practice-order-api", {
      restApiName: "E-commerce Practice Order Service",
      handler: instanceMicroservice,
      proxy: false,
    });

    // GET /order
    const root = apigw.root.addResource("order");
    root.addMethod('GET');  // GET /order   

    // Single order with id parameter
    // GET /order/{id}
    const single = root.addResource("{userName}"); // order/{userName}
    single.addMethod('GET');  // GET /order/{userName}
    // expected request : xxx/order/swn?orderDate=timestamp
    // ordering ms grap input and query parameters and filter to dynamo db
  }
}
