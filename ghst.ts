import {HTTPRequest} from "./req.ts";
import {HTTPResponse as Resp} from "./res.ts";

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
	middleware: ((arg0: HTTPRequest,arg1: Resp) => void)[];
}

interface Req{
	method: Methods;
	callback: (arg0: HTTPRequest,arg1: Resp) => void;
}

export class GhstApplication{
	private _requests: {[key: string]: Req};
	private _middleware: ((arg0: HTTPRequest,arg1: Resp) => void)[];

	constructor(options?: MiddlewareOptions){
		this._requests = {};

		if(options) this._middleware = options.middleware;
		else this._middleware = [];
	}

	public onRequest(path: string,method: Methods,callback: (arg0: HTTPRequest,arg1: Resp) => void){
		this._requests[path] = {
			method,
			callback
		}
	}

	public static ContentType(contentType: string){
		return (_req: HTTPRequest,res: Resp) => {
			res.setHeader("Content-Type",contentType);
		}
	}

	public async listen(port: number,callback?: () => void){
		const server = Deno.listen({
			port
		});

		// deno-lint-ignore no-this-alias
		const self = this;

		if(callback) callback();

		for await(const conn of server){
			const httpConn = Deno.serveHttp(conn);

			for await(const requestEvent of httpConn){
				let path = requestEvent.request.url.split("/").slice(3).join("/");

				path = "/" + path;
				path = path.split("?")[0];

				if(self._requests[path] && self._requests[path].method === requestEvent.request.method){
					const req = new HTTPRequest(requestEvent,path);
					const res = new Resp();

					for(const middleware of self._middleware){
						middleware(req,res);
					}

					self._requests[path].callback(req,res);

					requestEvent.respondWith(
						new Response(res.body,{
							headers: res.headers,
							status: res.status
						})
					);
				} else{
					requestEvent.respondWith(
						new Response(`Cannot ${requestEvent.request.method} ${path}`)
					);
				}
			}
		}
	}
}