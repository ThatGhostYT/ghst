class HTTPRequest{
    private _reqs: any;
    public headers: {[key: string]: string};
    public path: string;
    public url: string;

    constructor(reqs: any,path: string,url: string){
        this._reqs = reqs;

        const header: {[key: string]: string} = {};
        for(const pair of this._reqs.request.headers){
            header[pair[0]] = pair[1];
        }

        this.headers = header;
        this.path = path.startsWith("/")
            ? path
            : "/" + path;
        this.url = url;
    }
}

export {HTTPRequest};
