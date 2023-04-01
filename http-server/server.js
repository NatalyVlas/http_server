const http = require('http');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const port = 8000;

const requestListener = (req, res) => {
    if (req.url === '/delete') {
        if (req.method === 'DELETE') {
            res.writeHead(200);
            res.end('Success!');
        } else {
            res.writeHead(405);
            res.end('HTTP method not allowed');
        }
    } else if (req.url === '/post') {
        if (req.method === 'POST') {
            res.writeHead(200);
            res.end('Success!');
        } else {
            res.writeHead(405);
            res.end('HTTP method not allowed');
        }
    } else if (req.url === '/get') {
        if (req.method === 'GET') {
            const files = fs.readdirSync(path.join(__dirname, "files"))
            let array = []
            files.forEach(file => {
                array.push(file)
            })
            res.writeHead(200);
            res.end(`Success! ${array.join(', ')}`);
        } else {
            res.writeHead(405);
            res.end('HTTP method not allowed');
        }
    } else if (req.url === '/redirect' & req.method === 'GET') {
        res.writeHead(301);
        req.url = '/redirected';
        res.end(`Ресурс доступен по новому адресу http://${host}:${port}${req.url}`);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Сервер запущен и доступен по адресу http://${host}:${port}`);
});