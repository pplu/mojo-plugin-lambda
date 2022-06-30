async function streamToString(stream) {
    // lets have a ReadableStream as a stream variable
    const chunks = [];

    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString("utf-8");
}

export async function handler(event) {
  console.log(event);

  const is_body_b64 = event.isBase64Encoded;
  let body_buff;
  if (is_body_b64) {
    body_buff = new Buffer(event.body, 'base64');
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

  const ua = await app.newMockUserAgent({maxRedirects:0});
  ua.server.reverseProxy = true;
  const res = await ua.request(request);

  const single_headers = {};
  const multi_headers = {};
  for (const header of Object.values(res.headers._getHeaders())) {
    const header_name = header.normalCase.toLowerCase();
    if (header_name == 'content-encoding') { continue }
    if (header.values.length == 1) {
      single_headers[header_name] = header.values[0];
    } else {
      multi_headers[header_name] = header.values;
    }
  }

  const body = await streamToString(res); 

  const type = single_headers['content-type'] || '';
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

