const AWS = require("aws-sdk"),
  { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb"),
  { DynamoDB } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: "eu-west-1",
});
const dynamodb = DynamoDBDocument.from(
  new DynamoDB({
    region: "eu-west-1",
  })
);
require("dotenv").config();

const productsData = [
  {
    id: "001",
    title: "BMW",
    description:
      "BMW has always set its marks as the most reliable car brand in the whole automobile industry.",
    price: 195,
  },
  {
    id: "002",
    title: "Mercedes-AMG",
    description:
      "AMG independently hires engineers and contracts with manufacturers to customize Mercedes-Benz AMG vehicles.",
    price: 170,
  },
  {
    id: "003",
    title: "Lamborghini",
    description:
      "Lamborghini S.p.A. is an Italian manufacturer of luxury sports cars and SUVs based in Sant'Agata Bolognese.",
    price: 310,
  },
  {
    id: "004",
    title: "Jaguar",
    description: "Jaguar is the luxury vehicle brand of Jaguar Land Rover",
    price: 190,
  },
  {
    id: "005",
    title: "Porsche",
    description:
      "Porsche has been in the car brand league since 1931. This Germany based automobile company.",
    price: 180,
  },
  {
    id: "006",
    title: "Lexus",
    description:
      "Lexus has always been a prominent car brand which has fairly served its purpose with good quality, speed and comfort.",
    price: 230,
  },
  {
    id: "007",
    title: "Bentley",
    description:
      "With offering a lavish blend of classic British charm with the modern technology",
    price: 330,
  },
];

const productsPutReqs = productsData.map((x) => ({
  PutRequest: {
    Item: x,
  },
}));

const stocksData = [
  {
    product_id: "001",
    count: 7,
  },
  {
    product_id: "002",
    count: 5,
  },
  {
    product_id: "003",
    count: 3,
  },
  {
    product_id: "004",
    count: 9,
  },
  {
    product_id: "005",
    count: 11,
  },
  {
    product_id: "006",
    count: 13,
  },
  {
    product_id: "007",
    count: 7,
  },
];

const stocksPutReqs = stocksData.map((x) => ({
  PutRequest: {
    Item: x,
  },
}));

const req = {
  RequestItems: {
    [process.env.PRODUCTS_TABLE_NAME]: productsPutReqs,
    [process.env.STOCKS_TABLE_NAME]: stocksPutReqs,
  },
};

dynamodb
  .batchWrite(req)
  .then(() => console.log("Done!"))
  .catch((err) => console.error(err));
