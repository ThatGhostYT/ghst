export class HTTPResponse{
	public body: string;
	public status: number;
	readonly headers: {[key: string]: string};

	constructor(){
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
}