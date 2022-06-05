import GhstApplication from "./mod.ts";

const ghst = new GhstApplication({
    middleware: [
        GhstApplication.ContentType("text/html")
    ]
});

ghst.onRequest("/","GET",(req,res) => {
    res.send(req.url);
});

ghst.listen(8080,() => console.log(`Listening in at http://localhost:${8080}`));