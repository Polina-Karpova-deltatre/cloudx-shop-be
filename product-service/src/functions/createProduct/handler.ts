import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, formatErrorResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 as uuidv4 } from "uuid";

import schema from "./schema";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const putProduct = async (eventBody) => {
  const { title, description, price, count } = eventBody;
  const id = uuidv4();

  await dynamo
    .put({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: {
        id,
        title,
        description,
        price,
      },
    })
    .promise();

  await dynamo
    .put({
      TableName: process.env.STOCKS_TABLE_NAME,
      Item: {
        product_id: id,
        count,
      },
    })
    .promise();

  return {
    id,
    title,
    description,
    price,
    count,
  };
};

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  console.log(event);
  try {
    const product = await putProduct(event.body);

    return formatJSONResponse({
      product,
    });
  } catch (error) {
    return formatErrorResponse({
      error,
    });
  }
};

export const main = middyfy(createProduct);
