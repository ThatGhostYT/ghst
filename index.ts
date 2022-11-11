import {GhstApplication} from "./mod.ts";

const ghst = new GhstApplication({
    middleware: [
        (_req,_res,plugins) => {
            plugins({ cookies: ["cookie"] });
        }
    ]
});

let i = 1;
ghst.onRequest("/","GET",(req,_res) => {
    console.log(req.has("cookies"),`- run number ${i}`);
    _res.send(`run number ${i}`);
    i++;
});

ghst.listen(8080,"0.0.0.0",() => console.log("running at :8080"));