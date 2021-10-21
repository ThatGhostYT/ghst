# ghst
A light-weight http framework built for Deno.

Example of usage:
```js
import {App} from "https://deno.land/x/ghst@ghst/ghst.js" // Documentation can be found at https://doc.deno.land/https/deno.land/x/ghst@ghst/ghst.js

const app = new App({
  middleware: []
});

app.makeRequest({path: "/",req_type: "GET"},(req,res) => {
  res.send("Hello World!");
});

app.start(8080);
```

Since this interacts with the web, use `Deno run --allow-net file_name` to run your code.

## How to make middleware
To make middleware, setup a javascript file and github repository.

You need to export a function which accepts 2 parameters, the `HTTPRequest` object and the `HTTPResponse` object.
```js
export function middleware_name(req,res){
  // Whatever you want the middleware to do!
}
```

Once you write your middleware, upload it to [deno](https://deno.land/x).

## Using middleware
The `App` class has built in middleware.
```js
const app = new App({
  middleware: [App.HTML] // Allows for you to type raw html into your res.send()
});
```

If you are using user-made middleware.
```js
import {App} from "https://deno.land/x/ghst@ghst/ghst.js";
import {middleware_name} from "middleware_url";

const app = new App({
  middleware: [middleware_name]
});
```

Its important when using middleware that you **do not** call the function.
