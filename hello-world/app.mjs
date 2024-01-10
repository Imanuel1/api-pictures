import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk'; // Import using default export
const s3 = new AWS.S3();
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
  //Log to view full Http request in CloudWatch
  //Log the entire event object in a more readable JSON format. Check the logged event in CloudWatch logs to see if there are any unexpected characters.
  // console.log('api event occurred:', JSON.stringify(event, null, 2));


  // example of picture obj
  const PICTUREDATA = [
    {
      image_id: uuid(),
      image_src: 'java script',
      image_tag: '12'
    },
  ];

  // Extract query parameters from the request
  const { tag, collection } = event.queryStringParameters;
  console.log("quey params in url event : ", tag, collection);

  // Perform authentication checks if needed


  try {
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
          // Handle POST request with binary images
          // const imageData = event.isBase64Encoded ? event.body : Buffer.from(event.body, 'base64');
          // console.log("this is event body :", event.body);
          const imageData = event.isBase64Encoded
            ? Buffer.from(event.body, 'base64')
            : Buffer.from(event.body);

          // Save the image to S3
          // console.log('****this is imageData:', imageData);

          const params = {
            Bucket: 'my-pictures-bucket',
            Key: `images/${uuid()}-${Date.now()}.jpg`, // Use keyAPI and a timestamp for a unique key
            Body: imageData, // error for imageData.data??
            ContentType: 'image/jpeg',
            ACL: 'public-read',
          };
          // console.log('****s3 params:', params);

          await s3.upload(params).promise();

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
      body: JSON.stringify({ message: 'Image uploaded successfully' }),
    };
  } catch (err) {
    console.log("throw error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};
