const http = require("node:http");
const fs = require("node:fs");
const url = require('node:url');
const bodyParser = require('body-parser');

let todos = [{ id: 1, description: "Finish this already" }, { id: 2, description: "Add a delete function" }, { id: 3, description: "Gotta dry clothes" }]

const server = http.createServer((req, res) => {
    // const parsedUrl = new URL(req)
    const requestUrl = url.parse(req.url, true); // Set `true` for query object
    console.log(1, requestUrl.path)
    console.log(2, requestUrl.query)
    console.log(3, requestUrl.hostname)
    console.log(4, requestUrl.params)
    console.log(5, requestUrl.url)
    console.log(6, requestUrl.pathname)
    console.log(7, requestUrl.query.name)
    console.log("==========================")
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Plain text!")
        return;
    }

    if (requestUrl.pathname === '/json') {
        const jsonData = {
            firstName: "bruce",
            lastName: 'wayne'
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(jsonData))
        return;
    }

    if (requestUrl.pathname === '/data') {

    }
    if (requestUrl.pathname === '/html') {
        res.writeHead(200, { "Content-Type": "text/html" });
        // res.end("<h1>Hey</h1>")
        // const html = fs.readFileSync("./index.html", "utf-8")
        // res.end(html)
        // //For more performance / 'streaming', use piping.
        fs.createReadStream(__dirname + "/index.html").pipe(res);
        return;
    }

    if (requestUrl.pathname === '/user') {
        const name = requestUrl.query.name || "Dan";
        let html = fs.readFileSync("./index.html", "utf-8")
        html = html.replace("{{name}}", name)
        res.end(html)
        return
    }

    if (requestUrl.pathname === "/reqMethod") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(req.method)
        return;
    }
    if (req.method === "POST") {
        if (requestUrl.pathname === '/add') {
            let body = [];
            return new Promise((resolve, reject) => {
                req
                    .on('data', chunk => {
                        body.push(chunk);
                    })
                    .on('end', () => {
                        body = JSON.parse(Buffer.concat(body));
                        todos.push(body)
                        res.writeHead(200, { "Content-Type": "application/json" });
                        resolve(res.end(JSON.stringify(todos)))
                        return;
                    });
            })

        }
    }
    if (req.method === "DELETE") {
        console.log("Delete!")
        if (requestUrl.pathname === '/delete') {
            const deleteId = requestUrl.query.id;
            if (!deleteId) {
                res.writeHead(400);
                res.end("No id provided")
                return
            }
            if (deleteId) {
                todos = todos?.filter(todo =>  todo.id !== Number(deleteId));
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(todos))
                return;
            }
           
        }
    }
    if (req.method === "GET") {
        if (requestUrl.pathname === '/get') {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(todos))
            return;
        }
    }


    if (requestUrl.pathname === '/todos') {
        const name = requestUrl.query.name;
        if (!name) {
            res.writeHead(404);
            res.end("Not authorized!")
            return
        }
        if (req.method === "POST") {
            const todo = requestUrl.query.todo;
            console.log("todo", todo)
            todos.push(todo);

            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify(todos))
            return;
        }

    }

    res.writeHead(404);
    res.end("Page not found: " + req.url)
})

// server.use(bodyParser.json());

server.listen(3000, () => {
    console.log("Server running on port 3000")
});

