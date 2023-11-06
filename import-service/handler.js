const AWS = require("aws-sdk");
const csvParser = require("csv-parser");

const S3 = new AWS.S3();
const sqs = new AWS.SQS();

const BUCKET_NAME = "pk-cloudx-upload-bucket";
const QUEUE_URL =
  "https://sqs.eu-west-1.amazonaws.com/975310027005/product-service-dev-CatalogItemsQueue-sOU3hWAbDSpz";

module.exports.importProductsFile = async (event) => {
  const fileName = event.queryStringParameters.name;
  const filePath = `uploaded/${fileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: filePath,
    Expires: 60 * 5,
    ContentType: "text/csv",
  };

  try {
    const signedUrl = await S3.getSignedUrlPromise("putObject", params);
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: signedUrl,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  }
};

const moveFileToParsedFolder = async (bucket, originalKey) => {
  const targetKey = originalKey.replace("uploaded/", "parsed/");

  // 1. Copy the file to the new location
  await S3.copyObject({
    Bucket: bucket,
    CopySource: `${bucket}/${originalKey}`,
    Key: targetKey,
  }).promise();

  // 2. Delete the file from its original location
  await S3.deleteObject({
    Bucket: bucket,
    Key: originalKey,
  }).promise();

  console.log(`Moved file from ${originalKey} to ${targetKey}`);
};

module.exports.importFileParser = async (event) => {
  try {
    const s3Object = event.Records[0].s3;
    const bucketName = s3Object.bucket.name;
    const objectKey = s3Object.object.key;

    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const s3Stream = await S3.getObject(params).createReadStream();

    await new Promise((resolve, reject) => {
      s3Stream
        .pipe(csvParser())
        .on("data", async (product) => {
          await sqs
            .sendMessage({
              QueueUrl: QUEUE_URL,
              MessageBody: JSON.stringify(product),
            })
            .promise();
        })
        .on("end", async () => {
          console.log(`Finished parsing file: ${objectKey}`);
          await moveFileToParsedFolder(bucketName, objectKey);
          resolve();
        })
        .on("error", (error) => {
          reject(
            new Error(
              `Error parsing file: ${objectKey}. Error: ${error.message}`
            )
          );
        });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `File processing started for ${objectKey}`,
      }),
    };
  } catch (error) {
    console.error("Error occurred:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
      }),
    };
  }
};
