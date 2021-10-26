class HTTPResponse{
    private _reqs: any;
    private _webRes: string | Uint8Array;
    private _headers: {[key: string]: string};
    public status: number;

    constructor(reqs: any){
        this._reqs = reqs;
        this._webRes = "";
        this._headers = {};
        this.status = 200;
    }

    send(text: string): this{
        this._webRes += text;
        return this;
    }

    sendFile(path: string): this{
        const fileHeaders: {[key: string]: string} = {
            ".png": "image/png",
            ".gif": "image/gif",
            ".jpeg": "image/jpeg",
            ".tiff": "image/tiff",
            ".csv": "text/csv",
            ".xml": "text/xml",
            ".md": "text/markdown",
            ".html": "text/html",
            ".htm": "text/html",
            ".json": "application/json",
            ".map": "application/json",
            ".txt": "text/plain",
            ".ts": "text/typescript",
            ".tsx": "text/tsx",
            ".js": "application/javascript",
            ".jsx": "text/jsx",
            ".gz": "application/gzip",
            ".css": "text/css",
            ".wasm": "application/wasm",
            ".mjs": "application/javascript",
            ".svg": "image/svg+xml"
        }

        const contents = Deno.readFileSync(path);

        this._webRes = contents;
        this.setHeader("Content-Type",fileHeaders[path.split(".")[1]]);

        return this;
    }

    setStatus(code: number): this{
        this.status = code;
        return this;
    }

    setHeader(name: string,value: any): this{
        this._headers[name] = value;
        return this;
    }

    _send(){
        this._reqs.respondWith(
            new Response(this._webRes,{
                status: this.status,
                headers: this._headers
            })
        );
    }
}

export {HTTPResponse};
