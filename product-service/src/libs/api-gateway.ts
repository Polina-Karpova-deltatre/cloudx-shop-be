import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, "body"> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

const headers = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "https://dyo5nc6rxggir.cloudfront.net",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response),
  };
};

export const formatNotFoundResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify(response),
  };
};

export const formatErrorResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify(response),
  };
};
