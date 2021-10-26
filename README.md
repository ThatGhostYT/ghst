# ghst
> **Important:** ghst does **not** support many express features!

A light-weight http framework built for Deno.

If pared up with [Deno Deploy](https://deno.com/deploy/) you can make a fully functional site that other people can see.

Example of usage:
```js
import {GhstApplication} from "https://deno.land/x/ghst@ghst/ghst.js" // Documentation can be found at https://doc.deno.land/https/deno.land/x/ghst@ghst/ghst.js

const app = new App({
  middleware: []
});

app.makeRequest("/","GET",(req,res) => {
  res.send("Hello World!");
});

app.start(8080,() => console.log("http://localhost:8080/");
```

Since this interacts with the web, use `Deno run --allow-net file_name` to run your code.

If your code interacts with files via `res.sendFile()` then run `Deno run --allow-net --allow-read file_name`.
