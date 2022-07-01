export default function lambdaPlugin(app, options = {}) {
  // inject a 'handler' function into the app
  app['handler'] = get_handler_for_application(app);
}

async function streamToString(stream) {
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
}

function get_handler_for_application(app) {
  // return lambda-compatible handler binded to the app that the plugin is bound to
  return async function handler(event) {
    //console.log(event);

    // Convert from what an ALB / API Gateway sends
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/lambda-functions.html#receive-event-from-load-balancer
    // to what mojojs expects 
    const is_body_b64 = event.isBase64Encoded;
    let body_buff;
    if (is_body_b64) {
      body_buff = new Buffer.from(event.body, 'base64');
    } else {
      body_buff = Buffer.from(event.body);
    }

    const request = {
      body: body_buff,
      headers: event.headers,
      insecure: false,
      method: event.httpMethod,
      //socketPath: null,
      url: event.path,
    };

    // Use a MockUserAgent to invoke the URL. This was heavily inspired by 
    // mojojs cli capability to invoke a URL
    const ua = await app.newMockUserAgent({maxRedirects:0});
    // Let 
    ua.server.reverseProxy = true;
    const res = await ua.request(request);

    // Start building the response that ALBs / API Gateways expect from a
    // Webapp that is generated from a Lambda
    // https://docs.aws.amazon.com/elasticloadbalancing/latest/application/lambda-functions.html#respond-to-load-balancer
    const single_headers = {};
    const multi_headers = {};
    for (const header of Object.values(res.headers._getHeaders())) {
      const header_name = header.normalCase.toLowerCase();
      // this is a hack:
      // mojo is returning the body of the request without gzip-encoding it, but returns the content-encoding: gzip header
      // we will return all headers unless content-encoding 
      if (header_name == 'content-encoding') { continue }
      if (header.values.length == 1) {
        single_headers[header_name] = header.values[0];
      } else {
        multi_headers[header_name] = header.values;
      }
    }

    // convert the body to a string
    const body = await streamToString(res);

    const type = single_headers['content-type'] || '';
    // in theory we can not base64 encode responses with some mime-types, but for the moment we
    // strive on the safer option of base64 encoding everything
    const encode_as_b64 = true;

    const lambda_r = {
      statusCode: res.statusCode,
      headers: single_headers,
      multiValueHeaders: multi_headers,
      isBase64Encoded: encode_as_b64,
    };
    if (encode_as_b64) {
      const buff = new Buffer.from(body);
      let base64data = buff.toString('base64');
      lambda_r.body = base64data;
    } else {
      lambda_r.body = body
    }

    await ua.stop();
    return(lambda_r);
  }
}
