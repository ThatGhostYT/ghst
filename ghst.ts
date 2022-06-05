interface Header{
	name: string;
	value: string;
}

interface Settings{
	defaultHeaders: Header[];
	defaultContent: string;
	middleware: (() => void)[];
	allow: {
		params: boolean,
		query: boolean
	}
}

type Methods = "GET"
	| "HEAD"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS
	| "TRACE"
	| "PATCH"

export class GhstApplication{
	private _settings: Settings;
	
	constructor(settings: Settings | string){
		this._settings = settings;
	}

	onRequest(path: string,method: Methods,callback: () => void)
}