# ghst
A light-weight http framework built for Deno.

Example of usage:
```js
import {App} from "https://deno.land/x/ghst@ghst/ghst.js" // Documentation can be found at https://doc.deno.land/https/deno.land/x/ghst@ghst/ghst.js

const app = new App({
  middleware: [] // Only middle ware we have so far is HTML which allows your request to display HTML.
});

app.makeRequest({path: "/",req_type: "GET"},(req,res) => {
  res.send("Hello World!");
});

app.start(8080);
```

Since this interacts with the web, use `Deno run --allow-net file_name` to run your code.
