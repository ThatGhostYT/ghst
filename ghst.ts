/**
 * @constructor
 */
class HTTPResponse{
    private reqs: any;
    public status: number;
    private webText: string;
    private header: any;

    constructor(reqs: any){
        this.reqs = reqs;
        this.status = 200;
        this.webText = "";
        this.header = {};
    }

    /**
     * @param {string} text
     */
    send(text: string){
        this.webText += text;
        return this;
    }

    /**
     * @param {number} code
     */
    setStatus(code: number){
        this.status = code;
        return this;
    }

    /**
     * @param {string} name
     * @param {string} value
     */
    setHeader(name: string,value: string){
        this.header[name] = value;
        return this;
    }

    _send(){
        this.reqs.respondWith(
            new Response(this.webText, {
                status: this.status,
                headers: this.header
            })
        );
    }
}

/**
 * @constructor
 */
class HTTPRequest{
    private reqs: any;
    public headers: any;
    public path: string;
    public url: string;

    /**
     * @param {string} path
     * @param {string} url
     */
    constructor(reqs: any,path: string,url: string){
        this.reqs = reqs;
        this.headers = this.reqs.request.headers;
        this.path = path;
        this.url = url;
    }
}

class App{
    static HTML(req: HTTPRequest,res: HTTPResponse){
        res.setHeader("content-type","text/html");
    }

    public middleware: Function[];
    private requests: any;

    /**
     * @typedef {{middleware: Function[]}} MiddlewareOptions
     * @param {MiddlewareOptions} options
     */
    constructor(options: any){
        this.middleware = options.middleware || [];
        this.requests = {};
    }

    /**
     * @typedef {{path: string, req_type: string}} RequestOptions
     * @param {RequestOptions} options
     * @param {function} callback
     */
    makeRequest(options: any,callback: Function){
        this.requests[options.path] = {
            req_type: options.req_type,
            callback: callback
        }
    }

    /**
     * @param {number} port
     * @param {function} callback
     */
    async start(port: number,callback: Function){
        const server = Deno.listen({
            port: port
        });

        console.log(`http://localhost:${port}/`);

        // deno-lint-ignore no-this-alias
        const self = this;

        if(callback instanceof Function){
            callback(port);
        }

        for await(const connection of server){
            serverHTTP(connection);
        }

        async function serverHTTP(connection: any) {
            const httpConn = Deno.serveHttp(connection);

            for await(const reqEvent of httpConn){
                let path = reqEvent.request.url.split("/").slice(3).join("/");
				path = "/" + path;

                if(self.requests[path] && reqEvent.request.method == self.requests[path].req_type){
                    const req = new HTTPRequest(reqEvent,path,reqEvent.request.url);
                    const res = new HTTPResponse(reqEvent);
    
                    for(const middleware of self.middleware){
                        middleware(req,res);
                    }
    
                    self.requests[path].callback(req,res);
    
                    res._send();
                } else{
                    reqEvent.respondWith(
                        new Response(`CANNOT GET ${path}`, {
                            status: 404
                        })
                    );
                }
            }
        }
    }
}

export {App};