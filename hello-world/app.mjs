import { v4 as uuid } from 'uuid';
// import AWS from 'aws-sdk'
// const s3 = new AWS.S3();
// const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

export const lambdaHandler = async (event, context) => {
  // example of picture obj
  const PICTUREDATA = [
    {
      image_id: uuid(),
      image_src: 'jbvhvcgc3553',
      tag: '12',
    },
  ];

  // Extract parameters from the request
  // const { keyAPI, tag, collection } = JSON.parse(event.body);

  // Perform authentication checks if needed


  try {
    //Log to view full Http request in CloudWatch
    console.log('api event occured :', event);
    let result = '';

    if (event.resource === '/picture') {
      // Save metadata to DynamoDB - for rate limiter and more...
      // const dynamoParams = {
      //   TableName: 'your-dynamodb-table-name',
      //   Item: {
      //     keyAPI,
      //     tag,
      //     collection,
      //     imageUrl: params.Key, // Assuming image URL is S3 key
      //     timestamp: Date.now(),
      //   },
      // };
      switch (event.httpMethod) {
        case 'GET':
          result = JSON.stringify(PICTUREDATA);

          // await dynamodb.put(dynamoParams).promise();
          break;
        case 'POST':
          // Save the image to S3
          // const imageData = JSON.parse(event.body);
          // const params = {
          //   Bucket: 'your-s3-bucket-name',
          //   Key: `images/${keyAPI}-${Date.now()}.jpg`, // Use keyAPI and a timestamp for a unique key
          //   Body: Buffer.from(imageData.data, 'base64'),
          //   ContentType: 'image/jpeg',
          //   ACL: 'public-read',
          // };

          // await s3.upload(params).promise();

          // Save metadata to DynamoDB - for rate limiter and more..

          // await dynamodb.put(dynamoParams).promise();

          PICTUREDATA.push(JSON.parse(event.body || ''));
          result = JSON.stringify(PICTUREDATA);
          break;
        default:
          break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: result,
      }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};
