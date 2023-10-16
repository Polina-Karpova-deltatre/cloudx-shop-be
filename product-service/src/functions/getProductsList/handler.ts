import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, formatErrorResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import { getProducts } from "@functions/data";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<
  unknown
> = async () => {
  try {
    const products = await getProducts();
    return formatJSONResponse({
      items: products,
    });
  } catch (error) {
    return formatErrorResponse({
      error,
    });
  }
};

export const main = middyfy(getProductsList);
