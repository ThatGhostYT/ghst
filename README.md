class GhstApplication

  constructor(options?: MiddlewareOptions)

    @param options
        Used to add middleware to your ghst application.

    @param on404
        A request callback for when a request tries to access content that does not exist on your web app. Any response status code will be replaced with 404.

  readonly on404: (arg0: HTTPRequest, arg1: HTTPResponse) => void
    How the application handles 404 requests.

    @example
        const ghst = new GhstApplication({
                on404(req,res){
                        res.setStatus(404).send(`Cannot ${req.method} ${req.requestUrl.path}`);                }
        });

  static ContentTypeHeaders: Record<string, string>
    Content types for (some) file extentions.
  onRequest(path: string, method: Methods, callback: (arg0: HTTPRequest, arg1: HTTPResponse) => void)
    Adds a request to your web app.

    @param path
        The path of the request.

    @param method
        The method of the request.

    @param callback
        The callback for when the request is requested.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
                res.setStatus(200).send("Welcome to my web app!");
        });

  static ContentType(contentType: string): MiddlewareFunc
    Middleware for setting a default content type header on all requests. Not recommended with 
use of sendFile().

    @deprecated
    @param contentType
        Sets each page to this content type.

    @example
        const ghst = new GhstApplication({
                middleware: [GhstApplication.ContentType("text/html")]
        });

  static Helmet(): MiddlewareFunc
    A function meant to mimic the behavior of the express {@link https://www.npmjs.com/package/helmet helmet middleware}.

    @example
        const ghst = new GhstApplication({
                middleware: [GhstApplication.Helmet()]
        });

  static JSON(): MiddlewareFunc
    Reads request body and parses it into a JSON value.

    @example
        const ghst = new GhstApplication({
                middleware: [GhstApplication.JSON()]
        });

        ghst.onRequest("/","GET",(req,res) => {
                res.json(req.body);
        });

  setStatic(path: string)
    Sets the static directory to avoid content type errors.

    @param path
        Directory you want to be static.

    @example
        const ghst = new GhstApplication();
        ghst.setStatic("./public/");

  async listen(port: number, hostname?: string, callback?: () => void)
    Starts listening for requests.

    @param port
        Port to host your web app on.

    @param callback
        Optional callback for when your web app starts listening for requests.

    @example
        const ghst = new GhstApplication();
        ghst.listen(8080,"0.0.0.0",() => console.log("Running on :3000"));

type Methods = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH"
  Every request method that Ghst supports.

type MiddlewareFunc = (arg0: HTTPRequest, arg1: HTTPResponse, arg2?: Deno.RequestEvent) => void  Type that describes a middleware function.

type ResponseBody = Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array> | string
  Every acceptable type that can be sent in the response body

class HTTPRequest

  constructor(req: Deno.RequestEvent, path: string, query: string) 
  readonly path: string
    Path of the request.

    @deprecated
  readonly query: string
    Any querys used in the request.

    @deprecated
  readonly url: string
    The url of the request.

    @deprecated
  readonly requestUrl: Url
    Details about the request url.
  readonly method: string
    Method of the request.
  readonly headers: Record<string, string>
  [key: string]: unknown
  has(propertyName: string)
    See whether an object is in this request object.

    @param propertyName
        Property to look for in the request object.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
         res.json(req.has("requestUrl"));
        });

class HTTPRequest

  constructor(req: Deno.RequestEvent, path: string, query: string) 
  readonly path: string
    Path of the request.

    @deprecated
  readonly query: string
    Any querys used in the request.

    @deprecated
  readonly url: string
    The url of the request.

    @deprecated
  readonly requestUrl: Url
    Details about the request url.
  readonly method: string
    Method of the request.
  readonly headers: Record<string, string>
  [key: string]: unknown
  has(propertyName: string)
    See whether an object is in this request object.

class HTTPResponse

  constructor(requestEvent: Deno.RequestEvent)
  body: ResponseBody
    The body of the response.
  status: number
    Status code of the response.
  readonly headers: { [key: string]: string; }
    Headers the response has.
  send(content: ResponseBody)
    Updates the body of the response.

    @param content
        The content the body will be updated to.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
                res.send("Hello World!");
        });

  json(content: any)
    Responds to the request with a JSON object. Use send or append instead, does the same now. 

    @param content
        JSON object to respond with.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
                res.json({ foo: "bar" });
        });

  sendFile(path: string)
    Sets the body of the response to be the contents of a file.

    @param path
        The file you want to show in the body of the response.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
                res.sendFile("./public/index.html");
        });

  render(path: string, values: Record<string, string>)
    Reads a file and replaces text with specified values.

    @param path
        The path of the file.

    @param values
        The values to replace text with.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
                res.render("./public/index.html",{ foo: "bar" });
        });

    @example
        ```html
        <body>
                <h1>{{ FOO }}</h1>
        </body>
        ```

  setHeader(name: string, value: string)
    Adds a header to the response.

    @param name
        The name of the header.

    @param value
        The value of the header.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
                res.setHeader("Content-Type","text/html").send("<h1>Hello World!</h1>")        
        });

  setStatus(code: number)
    Sets the status code of the response.

    @param code
        Status code.

    @example
        const ghst = new GhstApplication({
                on404: (req,res) => {
                        res.setStatus(404).send("404");
                }
        });

  redirect(url: string)
    Redirects the response using the Location header. Also sets the status to 308 so the request method doesn't change when redirected.

    @param url
        Url to redirect to.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/location-header","GET",(req,res) => {
                res.redirect("https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location");
        });

  end()
    Sends the request. If not called then will automatically be called.

    @example
        const ghst = new GhstApplication();

        ghst.onRequest("/","GET",(req,res) => {
                res.send("Hello World!");
                res.end();
                res.send("Welcome to my web app!"); // doesn't send.
        });