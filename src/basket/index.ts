import createBasket from './create';
import getAllBaskets from './get-all';
import getBasket from './get';
import deleteProduct from './delete';
import checkoutBasket from './checkout';

exports.handler = async(event: any) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    try {
      let body =  null;
      switch(event.httpMethod) {
        case 'GET':
          if (event.pathParameters != null) {
            body = await getBasket(event.pathParameters.userName); // GET /basket/{userName}
            } else {
            body = await getAllBaskets(event); // GET /basket
          }
          break;
        case 'POST':
            if (event.path == "/basket/checkout") {
                body = await checkoutBasket(event); // POST /basket/checkout
            } else {
                body = await createBasket(event); // POST /basket
            }
          break;
        case 'DELETE':
          // DELETE /product
          body = await deleteProduct(event);
          break;
        default:
          throw new Error(`Unsupported route: "${event.httpMethod}"`)
      }

      console.log(body);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Successfully finished operation: "${event.httpMethod}"`,
          body: body
        })
      };
    } catch(err: any) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to perform operation.",
          errorMsg: err.message,
          errorStack: err.stack,
        })
      };
    }
}