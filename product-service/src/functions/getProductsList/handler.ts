import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, formatErrorResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const getProducts = async () => {
  const productScanResults = await dynamo
    .scan({ TableName: process.env.PRODUCTS_TABLE_NAME })
    .promise();
  const stockScanResults = await dynamo
    .scan({ TableName: process.env.STOCKS_TABLE_NAME })
    .promise();

  return productScanResults.Items.map((item) => {
    const count = stockScanResults.Items.find(
      (stock) => stock.product_id === item.id
    ).count;

    return {
      ...item,
      count,
    };
  });
};

const getProductsList: ValidatedEventAPIGatewayProxyEvent<unknown> = async (
  event
) => {
  console.log(event);
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
