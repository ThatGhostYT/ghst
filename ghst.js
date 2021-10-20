class HTTPResponse{
    constructor(reqs){
        this._reqs = reqs;
        this.status = 200;
        this._text = "";
        this._header = {};
    }

    /**
     * @param {string} text
     */
    send(text){
        this._text += text;
        return this;
    }

    /**
     * @param {number} code
     */
    status(code){
        this.status = code;
        return this;
    }

    /**
     * @param {string} name
     * @param {string} value
     */
    setHeader(name,value){
        this._header[name] = value;
        return this;
    }

    _send(){
        this._reqs.respondWith(
            new Response(this._text, {
                status: this.status,
                headers: this._header
            })
        );
    }
}

class HTTPRequest{
    /**
     * @param {string} path
     * @param {string} url
     */
    constructor(reqs,path,url){
        this._reqs = reqs;
        this.headers = this._reqs.request.headers;
        this.path = path;
        this.url = url;
    }
}

class App{
    static HTML(req,res){
        res.setHeader("content-type","text/html");
    }

    /**
     * @typedef {{middleware: string[]}} MiddlewareOptions
     * @param {MiddlewareOptions} options
     */
    constructor(options){
        this.middleware = options.middleware || [];
        this.requests = {};
    }

    /**
     * @typedef {{path: string, req_type: string}} RequestOptions
     * @param {RequestOptions} options
     * @param {function} callback
     */
    makeRequest(options,callback){
        this.requests[options.path] = {
            req_type: options.req_type,
            callback: callback
        }
    }

    /**
     * @param {number} port
     * @param {function} callback
     */
    async start(port,callback){
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

        async function serverHTTP(connection) {
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