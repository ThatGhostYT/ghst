interface Url{
    url: string;
    query: {
        parsed: {[key: string]: string};
        queryString: string;
        toString(): string;
    };
    path: string;
    toString(): string;
}

export class HTTPRequest<T extends Record<string,unknown> =Record<never,never>>{
    /**
     * Path of the request.
     * @deprecated
     */
    readonly path: string;

    /**
     * Any querys used in the request.
     * @deprecated
     */
    readonly query: string;

    /**
     * The url of the request.
     * @deprecated
     */
    readonly url: string;

    /**
     * Details about the request url.
     */
    readonly requestUrl: Url;

    /**
     * Method of the request.
     */
    readonly method: string;
    private _request: Deno.RequestEvent;

    [key: string]: unknown;
    
    constructor(req: Deno.RequestEvent,path: string,query: string,plugins?: T){
        this._request = req;
        this.path = path;
        
        this.query = query;

        const parsed: {[key: string]: string} = {};

        query = query.replace("?","");

        for(const q of query.split("&")){
            const name = q.split("=")[0];
            const value = q.split("=")[1];

            parsed[name] = value;
        }

        this.url = this._request.request.url;
        this.requestUrl = {
            url: this._request.request.url,
            query: {
                parsed,
                queryString: query,
                toString(){
                    return this.queryString;
                }
            },
            path,
            toString(){
                return this.url;
            }
        }
        this.method = this._request.request.method;

        if(plugins){
            for(const key of Object.keys(plugins)){
                this[key] = plugins[key];
            }
        }
    }

    public has(propertyName: string){
        return propertyName in this;
    }
}