export class HTTPRequest{
    public path: string;
    public query: string;
    public url: string;
    private _request: Deno.RequestEvent;

    constructor(req: Deno.RequestEvent,path: string,query?: string){
        this._request = req;
        this.path = path;
        this.query = query || "";
        this.url = this._request.request.url;
    }
}