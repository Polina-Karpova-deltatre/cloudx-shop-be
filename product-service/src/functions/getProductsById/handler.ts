import { getProducts } from "@functions/data";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import {
  formatJSONResponse,
  formatNotFoundResponse,
  formatErrorResponse,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const getProductsById: ValidatedEventAPIGatewayProxyEvent<unknown> = async (
  event
) => {
  try {
    const { productId } = event.pathParameters;
    const products = await getProducts();
    const product = products.find(({ id }) => id === productId);

    if (!product) {
      formatNotFoundResponse({
        message: `Product with id: ${productId} is not found`,
      });
    }

    return formatJSONResponse({
      product,
    });
  } catch (error) {
    return formatErrorResponse({
      error,
    });
  }
};

export const main = middyfy(getProductsById);
