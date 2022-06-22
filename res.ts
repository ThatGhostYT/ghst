import {GhstApplication} from "./ghst.ts";

type ResponseBody = Blob
	| BufferSource
	| FormData
	| URLSearchParams
	| ReadableStream<Uint8Array>
	| string;

export class HTTPResponse{
	/**
	 * The body of the response.
	 */
	public body: ResponseBody;

	/**
	 * Status code of the response.
	 */
	public status: number;

	/**
	 * Headers the response has.
	 */
	readonly headers: {[key: string]: string};

	constructor(){
		this.body = "";
		this.status = 200;
		this.headers = {};
	}

	/**
	 * Updates the body of the response.
	 * @param content The content the body will be updated to.
	 */
	public send(content: ResponseBody){
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
	 * Reads a file and replaces text with specified values.
	 * @param path The path of the file.
	 * @param values The values to replace text with.
	 */
	public render(path: string,values: {[key: string]: string}){
		const contTypeHeaders = Object.keys(GhstApplication.ContentTypeHeaders);
		const fileType = `.${path.replace(/\.\//,"").split(".")[1]}`;
		const findableContType = contTypeHeaders.includes(fileType);

		if(!findableContType) throw new Error("Cannot find content type.");
		
		const type = GhstApplication.ContentTypeHeaders[`.${path.split(".")[1]}`]

		const decoder = new TextDecoder();
		let content = decoder.decode(Deno.readFileSync(path));

		for(const value of Object.keys(values)){
			content = content.replace(
				new RegExp(`{{\\s*${value.toUpperCase()}\\s*}}`,"g"),
				values[value]
			);
		}

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