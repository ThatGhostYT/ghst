export class HTTPResponse{
    private _request: Deno.RequestEvent;
	public body: string;
	public status: number;
	readonly headers: {[key: string]: string};

	constructor(req: Deno.RequestEvent){
		this._request = req;
		this.body = "";
		this.status = 200;
		this.headers = {};
	}

	public send(content: string){
		this.body += content;
		return this;
	}

	public setHeader(name: string,value: string){
		this.headers[name] = value;
		return this;
	}

	public setStatus(code: number){
		this.status = code;
		return this;
	}

	public end(){
		this._request.respondWith(
			new Response(this.body,{
				headers: this.headers
			})
		)
	}
}