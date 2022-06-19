import {HTTPRequest} from "./req.ts";
import {HTTPResponse} from "./res.ts";

type Methods = "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH";

interface MiddlewareOptions{
	middleware: ((arg0: HTTPRequest,arg1: HTTPResponse) => void)[];
}

interface Req{
	method: Methods;
	callback: (arg0: HTTPRequest,arg1: HTTPResponse) => void;
}

export class GhstApplication{
	private _requests: {[key: string]: Req};
	private _middleware: ((arg0: HTTPRequest,arg1: HTTPResponse) => void)[];
	private _on404: (arg0: HTTPRequest,arg1: HTTPResponse) => void;

	/**
	 * @param options Used to add middleware to your ghst application.
	 * @param on404 A request callback for when a request tries to access content that does not exist on your web app. Any response status code will be replaced with 404.
	 */
	constructor(options?: MiddlewareOptions,on404?: (arg0: HTTPRequest,arg1: HTTPResponse) => void){
		this._requests = {};

		if(options) this._middleware = options.middleware;
		else this._middleware = [];

		if(on404) this._on404 = on404;
		else this._on404 = (req,res) => {
			res.send(`Cannot ${req.method} ${req.requestUrl.path}`);
		}
	}

	/**
	 * Adds a request to your web app.
	 * @param path The path of the request.
	 * @param method The method of the request.
	 * @param callback The callback for when the request is requested.
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
	 * @param contentType 
	 */
	public static ContentType(contentType: string){
		return (_req: HTTPRequest,res: HTTPResponse) => {
			res.setHeader("Content-Type",contentType);
		}
	}

	/**
	 * Content types for (some) file extentions.
	 */
	public static ContentTypeHeaders: {[key: string]: string} = {
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
	 * Sets the static directory to avoid content type errors.
	 * @param path Directory you want to be static.
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
				}
				if(entry.isDirectory){
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
	 */
	public async listen(port: number,callback?: () => void){
		const server = Deno.listen({
			port
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
					const req = new HTTPRequest(requestEvent,path,"?" + (query[1] || ""))
					const res = new HTTPResponse(requestEvent,path);

					for(const middleware of this._middleware){
						middleware(req,res);
					}

					this._requests[path].callback(req,res);

					requestEvent.respondWith(
						new Response(res.body,{
							headers: res.headers,
							status: res.status
						})
					);
				} else{
					const req = new HTTPRequest(requestEvent,path,"?" + (query[1] || ""))
					const res = new HTTPResponse(requestEvent,path);

					for(const middleware of this._middleware){
						middleware(req,res);
					}

					this._on404(req,res);

					requestEvent.respondWith(
						new Response(res.body,{
							headers: res.headers,
							status: 404
						})
					);
				}
			}
		}
	}
}