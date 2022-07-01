import lambdaPlugin from '../lib/lambda.js';
import mojo from '@mojojs/core';
import t from 'tap';

t.test('lambdaPlugin', async t => {
  const app = mojo({mode: 'testing'});
  
  app.plugin(lambdaPlugin);

  app.get('/', async ctx => {
    await ctx.render({text: 'ROOT'});
  });

  await t.test('Get', async () => {
    const res = await app.handler({
      "requestContext": {
        "elb": {
          "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/tg-name/1111111111111111"
        }
      },
      "httpMethod": "GET",
      "path": "/",
      "queryStringParameters": {},
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate",
        "accept-language": "en-US,en;q=0.9,ca;q=0.8,es;q=0.7",
        "connection": "keep-alive",
        "host": "xxxxx-xxxxx-xxxxxxxxxxxx-xxxxxxxxxx.us-east-1.elb.amazonaws.com",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
        "x-amzn-trace-id": "Root=1-00000000-000000000000000000000000",
        "x-forwarded-for": "100.10.100.100",
        "x-forwarded-port": "80",
        "x-forwarded-proto": "http"
      },
      "body": "",
      "isBase64Encoded": false
    });

    t.equal(res.statusCode, 200, 'expected status-code');
    t.equal(res.body, 'Uk9PVA==', 'ROOT base64-encoded');
  });

  await t.test('Invalid URL', async () => {
    const res = await app.handler({
      "requestContext": {
        "elb": {
          "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:000000000000:targetgroup/tg-name/1111111111111111"
        }
      },
      "httpMethod": "GET",
      "path": "/notfound",
      "queryStringParameters": {},
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate",
        "accept-language": "en-US,en;q=0.9,ca;q=0.8,es;q=0.7",
        "connection": "keep-alive",
        "host": "xxxxx-xxxxx-xxxxxxxxxxxx-xxxxxxxxxx.us-east-1.elb.amazonaws.com",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
        "x-amzn-trace-id": "Root=1-00000000-000000000000000000000000",
        "x-forwarded-for": "100.10.100.100",
        "x-forwarded-port": "80",
        "x-forwarded-proto": "http"
      },
      "body": "",
      "isBase64Encoded": false
    });

    t.equal(res.statusCode, 404, 'expected status-code');
  });


});
