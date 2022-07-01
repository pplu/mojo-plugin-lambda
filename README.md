# mojo-plugin-lambda

Run your mojojs application inside AWS Lambda

```
npm install mojo-plugin-lambda
```

In your mojojs code:

```
import lambdaPlugin from 'mojo-plugin-lambda';
```

Then after `const app = mojo();` enable the plugin


```
app.plugin(lambdaPlugin, {});
const handler = app.handler;
export { handler };
```

This installs a handler function for AWS Lambda to invoke. Set your Lambdas entrypoint to `appfile.handler` 
(where `appfile` is the main file of your application.

Finally, delete `app.start()` from the end of your application file. You can alternatively invoke it whenever
it is not running inside a Lambda environment.

```
if (! process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.start();
}
```

Zip your code (or create a Lambda Container Image), upload it, and profit

## Author

Jose Luis Martinez Torres

## Copyright

(c) Jose Luis Martinez Torres 2022

## License

Apache 2
