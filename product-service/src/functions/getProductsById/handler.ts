import { getProducts } from "@functions/data";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import {
  formatJSONResponse,
  formatNotFoundResponse,
  formatErrorResponse,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const getProduct = async (id) => {
  const productQueryResult = await dynamo
    .query({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();
  const stockQueryResult = await dynamo
    .query({
      TableName: process.env.STOCKS_TABLE_NAME,
      KeyConditionExpression: "product_id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();

  return {
    ...productQueryResult.Items[0],
    count: stockQueryResult.Items[0].count,
  };
};

const getProductsById: ValidatedEventAPIGatewayProxyEvent<unknown> = async (
  event
) => {
  console.log(event);
  try {
    const { productId } = event.pathParameters;
    const product = await getProduct(productId);

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
