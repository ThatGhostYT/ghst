export class HTTPRequest{
    /**
     * Path of the request.
     */
    readonly path: string;

    /**
     * Any querys used in the request.
     */
    readonly query: string;

    /**
     * The url of the request.
     */
    readonly url: string;

    /**
     * Method of the request.
     */
    readonly method: string;
    private _request: Deno.RequestEvent;
    
    constructor(req: Deno.RequestEvent,path: string,query: string){
        this._request = req;
        this.path = path;
        
        this.query = query;

        this.url = this._request.request.url;
        this.method = this._request.request.method;
    }
}