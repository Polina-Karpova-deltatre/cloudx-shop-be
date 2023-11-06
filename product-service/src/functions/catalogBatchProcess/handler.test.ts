import { catalogBatchProcess } from "./handler";

jest.mock("aws-sdk", () => {
  const dynamoPutImpl = jest.fn();
  const snsPublishImpl = jest.fn();

  return {
    SNS: jest.fn(() => ({
      publish: snsPublishImpl,
    })),
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: dynamoPutImpl,
      })),
    },
    __mocks__: {
      dynamoPutImpl,
      snsPublishImpl,
    },
  };
});

const {
  __mocks__: { dynamoPutImpl, snsPublishImpl },
} = require("aws-sdk");

describe("catalogBatchProcess", () => {
  beforeEach(() => {
    dynamoPutImpl.mockReset();
    snsPublishImpl.mockReset();

    process.env.CREATE_PRODUCT_TOPIC_ARN = "testTopicArn";
    process.env.PRODUCTS_TABLE_NAME = "testProductsTable";
    process.env.STOCKS_TABLE_NAME = "testStocksTable";
  });

  it("should process SQS records and save products to DynamoDB and SNS", async () => {
    const mockEvent: any = {
      Records: [
        {
          body: JSON.stringify({
            title: "Test Product",
            description: "Description",
            price: 10,
            count: 5,
          }),
        },
      ],
    };

    dynamoPutImpl.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({}),
    });

    snsPublishImpl.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({}),
    });

    await catalogBatchProcess(mockEvent);

    // Check if DynamoDB was called with the correct parameters
    expect(dynamoPutImpl).toHaveBeenCalledTimes(2);

    // Check if SNS publish was called with the correct parameters
    expect(snsPublishImpl).toHaveBeenCalledWith({
      TopicArn: "testTopicArn",
      Message: "New products have been created.",
      Subject: "Product Creation Notification",
      MessageAttributes: {
        title: {
          DataType: "String",
          StringValue: "Test Product",
        },
      },
    });
  });
});
