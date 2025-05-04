import createProduct from './create';
import getAllProducts from './get-all';
import getProduct from './get';
import updateProduct from './update';
import getProductByCategory from './get-product-by-category';
import deleteProduct from './delete';

exports.handler = async(event: any) => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    try {
      let body =  null;
      switch(event.httpMethod) {
        case 'GET':
          body = await getAllProducts(event); // GET product
          
          if (event.queryStringParameters != null) {
            // GET product/1234?category=Phone
            body = await getProductByCategory(event);
          } else if (event.pathParameters != null) {
            // GET product/{id}
            body =  await getProduct(event.pathParameters.id)
          }
          break;
        case 'POST':
          // POST /product
          body = await createProduct(event);
          break;
        case 'PUT':
          // PUT /product
          body = await updateProduct(event);
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