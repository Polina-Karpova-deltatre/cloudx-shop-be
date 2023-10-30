import type { AWS } from "@serverless/typescript";

import {
  getProductsList,
  getProductsById,
  createProduct,
  catalogBatchProcess,
} from "@functions/index";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-export-env"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      PRODUCTS_TABLE_NAME: { Ref: "ProductsTable" },
      STOCKS_TABLE_NAME: { Ref: "StocksTable" },
      CREATE_PRODUCT_TOPIC_ARN: {
        Ref: "CreateProductTopic",
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: [
              {
                "Fn::GetAtt": ["ProductsTable", "Arn"],
              },
            ],
          },
          {
            Effect: "Allow",
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: [
              {
                "Fn::GetAtt": ["StocksTable", "Arn"],
              },
            ],
          },
          {
            Effect: "Allow",
            Action: [
              "sqs:ReceiveMessage",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
            ],
            Resource: {
              "Fn::GetAtt": ["CatalogItemsQueue", "Arn"],
            },
          },
          {
            Effect: "Allow",
            Action: ["sns:Publish"],
            Resource: {
              Ref: "CreateProductTopic",
            },
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: {
    getProductsList,
    getProductsById,
    createProduct,
    catalogBatchProcess,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      ProductsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          BillingMode: "PAY_PER_REQUEST",
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
        },
      },
      StocksTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          BillingMode: "PAY_PER_REQUEST",
          AttributeDefinitions: [
            {
              AttributeName: "product_id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "product_id",
              KeyType: "HASH",
            },
          ],
        },
      },
      CatalogItemsQueue: {
        Type: "AWS::SQS::Queue",
      },
      CreateProductTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          DisplayName: "Product Creation Topic",
          TopicName: "createProductTopic",
        },
      },
      CreateProductTopicSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          TopicArn: {
            Ref: "CreateProductTopic",
          },
          Endpoint: "polina_karpova@epam.com",
        },
      },
      SpecialTitleProductSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          TopicArn: {
            Ref: "CreateProductTopic",
          },
          Endpoint: "polina_karpova+1@epam.com",
          FilterPolicy: {
            title: ["specialTitle"],
          },
        },
      },
    },
    Outputs: {
      ProductsTableName: {
        Value: "!Ref ProductsTable",
        Description: "Products table",
      },
      StocksTableName: {
        Value: "!Ref StocksTable",
        Description: "Stocks table",
      },
    },
  },
};

module.exports = serverlessConfiguration;
