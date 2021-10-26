import {HTTPRequest} from "./req.ts";
import {HTTPResponse} from "./res.ts";

interface MiddlewareOptions{
    middleware: Function[]
}

interface PathOptions{
    method: string;
    callback: Function;
}

class GhstApplication{
    public requests: {[key: string]: PathOptions}
    public middleware: Function[]

    constructor(options: MiddlewareOptions){
        this.requests = {}
        this.middleware = options.middleware;
    }

    onRequest(path: string,method: string,callback: Function){
        this.requests[path] = {
            method: "GET",
            callback: callback
        }
    }

    async start(port: number,callback?: Function){
        const server = Deno.listen({
            port: port
        });

        // deno-lint-ignore no-this-aliase
        const self: this = this;

        if(callback instanceof Function){
            callback();
        }

        for await(const connection of server){
            serveHTTP(connection);
        }

        async function serveHTTP(connection: any){
            const HTTPConnection = Deno.serveHttp(connection);

            for await(const reqs of HTTPConnection){
                let path = reqs.request.url.split("/").slice(3).join("/");
                path = "/" + path;

                if(self.requests[path] && reqs.request.method === self.requests[path].method){
                    const req = new HTTPRequest(reqs,path,reqs.request.url);
                    const res = new HTTPResponse(reqs);

                    for(const middleware of self.middleware){
                        middleware(req,res);
                    }

                    self.requests[path].callback(req,res);

                    res._send();
                } else{
                    if(self.requests["/*"] && self.requests["/*"].method === "GET"){
                        const req = new HTTPRequest(reqs,path,reqs.request.url);
                        const res = new HTTPResponse(reqs);

                        res.setStatus(404);

                        for(const middleware of self.middleware){
                            middleware(req,res);
                        }

                        self.requests["/*"].callback(req,res);

                        res._send();
                    } else{
                        reqs.respondWith(
                            new Response(`<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<title>404 Page not Found</title>\n<body>\n<h1>404</h1>\n<p>Request <b>${path}</b> not found!</p>\n</body>\n</html>`,{
                                status: 404,
                                headers: {
                                    "Content-Type": "text/html"
                                }
                            })
                        );
                    }
                }
            }
        }
    }
}

export {GhstApplication};
