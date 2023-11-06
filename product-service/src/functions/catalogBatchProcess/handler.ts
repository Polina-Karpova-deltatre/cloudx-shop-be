import { SQSEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

const AWS = require("aws-sdk");
const sns = new AWS.SNS();
const dynamo = new AWS.DynamoDB.DocumentClient();

export const catalogBatchProcess = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const product = JSON.parse(record.body);

    await saveToDynamoDB(product);

    await sns
      .publish({
        TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
        Message: "New products have been created.",
        Subject: "Product Creation Notification",
        MessageAttributes: {
          title: {
            DataType: "String",
            StringValue: product.title || "No title",
          },
        },
      })
      .promise();
  }
};

const saveToDynamoDB = async (product) => {
  try {
    const { title, description, price, count } = product;
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
  } catch (error) {
    console.error("Product Creation Failed:", error);
  }
};

export const main = catalogBatchProcess;
