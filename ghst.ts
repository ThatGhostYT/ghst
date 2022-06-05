import {HTTPResponse as resp} from "./res.ts";

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
	middleware: ((arg0: resp) => void)[];
}

interface Req{
	method: Methods;
	callback: (arg0: resp) => void;
}

export class GhstApplication{
	private _requests: {[key: string]: Req};
	private _middleware: ((arg0: resp) => void)[] | [];

	constructor(options?: MiddlewareOptions){
		this._requests = {};

		if(options) this._middleware = options.middleware;
		else this._middleware = [];
	}

	public onRequest(path: string,method: Methods,callback: (arg0: resp) => void){
		this._requests[path] = {
			method,
			callback
		}
	}

	public listen(port: number,callback?: () => void){
		
	}
}