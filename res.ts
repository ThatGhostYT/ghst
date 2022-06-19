import {GhstApplication} from "./ghst.ts";

export class HTTPResponse{
	/**
	 * The body of the response.
	 */
	public body: string;

	/**
	 * Status code of the response.
	 */
	public status: number;

	/**
	 * Headers the response has.
	 */
	readonly headers: {[key: string]: string};
	private _request: Deno.RequestEvent;
	private _path: string;

	constructor(req: Deno.RequestEvent,path: string){
		this.body = "";
		this.status = 200;
		this.headers = {};
		this._request = req;
		this._path = path;
	}

	/**
	 * Updates the body of the response.
	 * @param content The content the body will be updated to.
	 */
	public send(content: string){
		this.body = content;
		return this;
	}

	/**
	 * Sets the body of the response to be the contents of a file.
	 * @param path The file you want to show in the body of the response.
	 */
	public sendFile(path: string){
		const contTypeHeaders = Object.keys(GhstApplication.ContentTypeHeaders);
		const fileType = `.${path.replace(/\.\//,"").split(".")[1]}`;
		const findableContType = contTypeHeaders.includes(fileType);

		if(!findableContType) throw new Error("Cannot find content type.");
		
		const type = GhstApplication.ContentTypeHeaders[`.${path.split(".")[1]}`]
	
		const decoder = new TextDecoder();
		const content = decoder.decode(Deno.readFileSync(path));

		this.setHeader("Content-Type",type);
		this.send(content);
		return this;
	}

	/**
	 * Adds a header to the response.
	 * @param name The name of the header.
	 * @param value The value of the header.
	 */
	public setHeader(name: string,value: string){
		this.headers[name] = value;
		return this;
	}

	/**
	 * Sets the status code of the response.
	 * @param code Status code.
	 */
	public setStatus(code: number){
		this.status = code;
		return this;
	}
}