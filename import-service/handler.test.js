const { importProductsFile } = require("./handler");

describe("importProductsFile", () => {
  const event = {
    queryStringParameters: {
      name: "test.csv",
    },
  };

  test("returns a signed URL with a 5-minute expiration time", async () => {
    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(200);
    expect(response.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(response.headers["Access-Control-Allow-Credentials"]).toBe(true);

    const responseBody = JSON.parse(response.body);
    expect(responseBody.url).toMatch(/^https:\/\/.+\.amazonaws\.com\/.+$/);
  });
});
