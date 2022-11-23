import {HTTPRequest} from "./req.ts";
import {HTTPResponse} from "./res.ts";

/**
 * Every acceptable type that can be sent in the response body.
 */
export type ResponseBody = Blob
	| BufferSource
	| FormData
	| URLSearchParams
	| ReadableStream<Uint8Array>
	| string;

/**
 * Every request method that Ghst supports.
 */
export type Methods = "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH";

/**
 * Type that describes a middleware function.
 */
export type MiddlewareFunc = (arg0: HTTPRequest,arg1: HTTPResponse,arg2?: Deno.RequestEvent) => void

interface MiddlewareOptions{
	/**
	 * All middleware used in the application.
	 * @example
	 * const ghst = new GhstApplication({
	 * 	middleware: [GhstApplication.ContentType("text/html")]
	 * });
	 */
	middleware?: MiddlewareFunc[];
	/**
	 * A function to call when a request is made to a route that doesn't exist. Used for every method.
	 * @example
	 * const ghst = new GhstApplication({
	 * 	on404: (req,res) => {
	 * 		res.setStatus(404).send("404");
	 * 	}
	 * })
	 */
	on404?: (arg0: HTTPRequest,arg1: HTTPResponse) => void;
}

interface Req{
	method: Methods;
	callback: (arg0: HTTPRequest,arg1: HTTPResponse) => void;
}

export class GhstApplication{
	private _requests: Record<string,Req>;
	private _middleware: MiddlewareFunc[];

	/**
	 * How the application handles 404 requests.
	 * @example
	 * const ghst = new GhstApplication({
	 * 	on404(req,res){
	 * 		res.setStatus(404).send(`Cannot ${req.method} ${req.requestUrl.path}`);
	 * 	}
	 * });
	 */
	readonly on404: (arg0: HTTPRequest,arg1: HTTPResponse) => void;

	/**
	 * @param options Used to add middleware to your ghst application.
	 * @param on404 A request callback for when a request tries to access content that does not exist on your web app. Any response status code will be replaced with 404.
	 */
	constructor(options?: MiddlewareOptions){
		this._requests = {};

		if(options?.middleware) this._middleware = options.middleware;
		else this._middleware = [];

		if(options?.on404) this.on404 = options.on404;
		else this.on404 = (req,res) => {
			res.send(`Cannot ${req.method} ${req.requestUrl.path}`);
		}
	}

	/**
	 * Adds a request to your web app.
	 * @param path The path of the request.
	 * @param method The method of the request.
	 * @param callback The callback for when the request is requested.
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.setStatus(200).send("Welcome to my web app!");
	 * });
	 */
	public onRequest(path: string,method: Methods,callback: (arg0: HTTPRequest,arg1: HTTPResponse) => void){
		this._requests[path] = {
			method,
			callback
		}
	}

	/**
	 * Middleware for setting a default content type header on all requests. Not recommended with use of sendFile().
	 * @deprecated
	 * @param contentType Sets each page to this content type.
	 * @example
	 * const ghst = new GhstApplication({
	 * 	middleware: [GhstApplication.ContentType("text/html")]
	 * });
	 */
	public static ContentType(contentType: string): MiddlewareFunc{
		return (_req: HTTPRequest,res: HTTPResponse) => {
			res.setHeader("Content-Type",contentType);
		}
	}

	/**
	 * A function meant to mimic the behavior of the express {@link https://www.npmjs.com/package/helmet helmet middleware}.
	 * @example
	 * const ghst = new GhstApplication({
	 * 	middleware: [GhstApplication.Helmet()]
	 * });
	 */
	public static Helmet(): MiddlewareFunc{
		return (_req: HTTPRequest,res: HTTPResponse) => {
			res.setHeader(
				"Content-Security-Policy",
				"default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests"
			)
				.setHeader("Cross-Origin-Embedder-Policy","require-corp")
				.setHeader("Cross-Origin-Opener-Policy","same-origin")
				.setHeader("Cross-Origin-Resource-Policy","same-origin")
				.setHeader("Origin-Agent-Cluster","?1")
				.setHeader("Referrer-Policy","no-referrer")
				.setHeader("Strict-Transport-Security","max-age=15552000; includeSubDomains")
				.setHeader("X-Content-Type-Options","nosniff")
				.setHeader("X-DNS-Prefetch-Control","off")
				.setHeader("X-Download-Options","noopen")
				.setHeader("X-Frame-Options","SAMEORIGIN")
				.setHeader("X-Permitted-Cross-Domain-Policies","none")
				.setHeader("X-XSS-Protection","0");
		}
	}

	/**
	 * Content types for (some) file extentions.
	 */
	public static ContentTypeHeaders: Record<string,string> = {
		".png": "image/png",
		".gif": "image/gif",
		".jpeg": "image/jpeg",
		".tiff": "image/tiff",
		".csv": "text/csv",
		".xml": "text/xml",
		".md": "text/markdown",
		".html": "text/html",
		".htm": "text/html",
		".json": "application/json",
		".map": "application/json",
		".txt": "text/plain",
		".ts": "text/typescript",
		".tsx": "text/tsx",
		".js": "application/javascript",
		".jsx": "text/jsx",
		".gz": "application/gzip",
		".css": "text/css",
		".wasm": "application/wasm",
		".mjs": "application/javascript",
		".svg": "image/svg+xml"
	}

	/**
	 * Reads request body and parses it into a JSON value.
	 * @example
	 * const ghst = new GhstApplication({
	 * 	middleware: [GhstApplication.JSON()]
	 * });
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.json(req.body);
	 * });
	 */
	public static JSON(): MiddlewareFunc{
		return async (req,_res,request) => {
			const v = new TextDecoder().decode(
				await request?.request.body?.getReader().read().then(({value}) => value)
			);

			let value;

			try{
				value = JSON.parse(v);
			} catch(e){
				value = e;
			}

			req.body = value;
		}
	}

	/**
	 * Sets the static directory to avoid content type errors.
	 * @param path Directory you want to be static.
	 * @example
	 * const ghst = new GhstApplication();
	 * ghst.setStatic("./public/");
	 */
	public setStatic(path: string){
		function addPaths(a: string,b: string){
			return a.endsWith("/") ? a + b : `${a}/${b}`;
		}

		function walkDir(dir: string){
			let entries: string[] = [];
			for(const entry of Deno.readDirSync(dir)){
				if(entry.isFile){
					entries.push(addPaths(dir,entry.name));
				} else if(entry.isDirectory){
					entries = entries.concat(walkDir(addPaths(dir,entry.name)));
				}
			}
			return entries;
		}

		const entries = walkDir(path);

		for(const entry of entries){
			this.onRequest(`/${entry}`,"GET",(_req,res) => {
				res.sendFile(entry);
			});
		}
	}

	/**
	 * Starts listening for requests.
	 * @param port Port to host your web app on.
	 * @param callback Optional callback for when your web app starts listening for requests.
	 * @example
	 * const ghst = new GhstApplication();
	 * ghst.listen(8080,"0.0.0.0",() => console.log("Running on :3000"));
	 */
	public async listen(port: number,hostname?: string,callback?: () => void){
		const server = Deno.listen({
			port,
			hostname
		});

		if(callback) callback();

		for await(const conn of server){
			const httpConn = Deno.serveHttp(conn);

			for await(const requestEvent of httpConn){
				let path = requestEvent.request.url.split("/").slice(3).join("/");

				path = "/" + path;
				
				const query = path.split("?");
				path = query[0];

				if(this._requests[path] && this._requests[path].method === requestEvent.request.method){
					const req = new HTTPRequest(requestEvent,path,"?" + (query[1] || ""));
					const res = new HTTPResponse(requestEvent);

					for(const middleware of this._middleware){
						middleware(req,res,requestEvent);
					}

					this._requests[path].callback(req,res);

					res.end();
				} else{
					const req = new HTTPRequest(requestEvent,path,"?" + (query[1] || ""));
					const res = new HTTPResponse(requestEvent);

					for(const middleware of this._middleware){
						middleware(req,res);
					}

					this.on404(req,res);

					res.end();
				}
			}
		}
	}
}