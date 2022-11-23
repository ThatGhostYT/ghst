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
	private _requestEvent: Deno.RequestEvent;
	private _called: boolean;

	constructor(requestEvent: Deno.RequestEvent){
		this.body = "";
		this.status = 200;
		this.headers = {};
		this._requestEvent = requestEvent;
		this._called = false;
	}

	/**
	 * Updates the body of the response.
	 * @param content The content the body will be updated to.
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.send("Hello World!");
	 * });
	 */
	public send(content: ResponseBody){
		this.body = content;
		return this;
	}

	/**
	 * Responds to the request with a JSON object. Use send or append instead, does the same now.
	 * @param content JSON object to respond with.
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.json({ foo: "bar" });
	 * });
	 */
	// deno-lint-ignore no-explicit-any
	public json(content: any){
		this.body = JSON.stringify(content);	
		return this;
	}

	/**
	 * Sets the body of the response to be the contents of a file.
	 * @param path The file you want to show in the body of the response.
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.sendFile("./public/index.html");
	 * });
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
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.render("./public/index.html",{ foo: "bar" });
	 * });
	 * @example
	 * ```html
	 * <body>
	 * 	<h1>{{ FOO }}</h1>
	 * </body>
	 * ```
	 */
	public render(path: string,values: Record<string,string>){
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
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.setHeader("Content-Type","text/html").send("<h1>Hello World!</h1>")
	 * });
	 */
	public setHeader(name: string,value: string){
		this.headers[name] = value;
		return this;
	}

	/**
	 * Sets the status code of the response.
	 * @param code Status code.
	 * @example
	 * const ghst = new GhstApplication({
	 * 	on404: (req,res) => {
	 * 		res.setStatus(404).send("404");
	 * 	}
	 * });
	 */
	public setStatus(code: number){
		this.status = code;
		return this;
	}

	/**
	 * Redirects the response using the Location header. Also sets the status to 308 so the request method doesn't change when redirected.
	 * @param url Url to redirect to.
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/location-header","GET",(req,res) => {
	 * 	res.redirect("https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location");
	 * });
	 */
	public redirect(url: string){
		this.setStatus(308).setHeader("Location",url).end();
		return this;
	}

	/**
	 * Sends the request. If not called then will automatically be called.
	 * @example
	 * const ghst = new GhstApplication();
	 * 
	 * ghst.onRequest("/","GET",(req,res) => {
	 * 	res.send("Hello World!");
	 * 	res.end();
	 * 	res.send("Welcome to my web app!"); // doesn't send.
	 * });
	 */
	public end(){
		if(!this._called){
			this._requestEvent.respondWith(
				new Response(this.body,{
					headers: this.headers,
					status: this.status
				})
			);
			this._called = true;
		}
	}
}