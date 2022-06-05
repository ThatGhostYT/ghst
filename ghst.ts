type Methods = "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "PATCH";

interface Header{
	name: string;
	value: string;
}

interface Settings{
	defaultHeaders: Header[] | [];
	defaultContent: string;
	middleware: (() => void)[] | [];
	allows: {
		params: boolean,
		query: boolean
	}
}

interface Req{
	path: string;
	callback: () => void;
}

export class GhstApplication{
	private _settings: Settings | string;
	private _requests: Req[];
	
	constructor(settings?: Settings){
		this._settings = settings
		this._requests
	}

	public onRequest(path: string,method: Methods,callback: () => void){
		this._requests.push({
			path,
			callback
		});
	}
}