const http = require('http');
const fs = require('fs');

const host = 'localhost';
const port = 8000;
const user = {
    id: 123,
    username: 'testuser',
    password: 'qwerty'
};

function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

const requestListener = (req, res) => {
    res.setHeader('Content-Type', 'text/html');

    const cookies = parseCookies(req);

    switch (req.url) {
        case '/auth':
            if (req.method !== 'POST') {
                const errMessage = `HTTP method not allowed`;
                res.writeHead(405);
                res.end(errMessage);
                break;
            }

            const body = [];
            let dataObj = {};

            req.on('data', (data) => {
                body.push(data)
            });

            req.on('end', () => {
                dataObj = JSON.parse(Buffer.concat(body).toString());
                if ((dataObj?.username === user.username) && (dataObj?.password === user.password)) {
                    const lifetime = new Date(new Date().getTime() + (1000 * 3600 * 24 * 2)).toUTCString();
                    res.writeHead(200, {
                        'Set-Cookie': [
                            'userId=' + user.id + '; expires=' + lifetime,
                            'authorized=true; expires=' + lifetime
                        ],
                    });
                    res.end('Success!');
                } else {
                    res.writeHead(400, {
                        'Set-Cookie': [
                            'userId= ; expires=0',
                            'authorized=false; expires=0'
                        ]
                    });
                    res.end('Неверный логин или пароль');
                }
            });
            break;

        case '/get':
            if (req.method !== 'GET') {
                const errMessage = `HTTP method not allowed`;
                res.writeHead(405);
                res.end(errMessage);
                break;
            }

            try {
                filenames = fs.readdirSync(__dirname + '/files');
            } catch (err) {
                res.writeHead(500);
                res.end('Internal server error');
                break;
            }

            res.writeHead(200);
            res.end(filenames.join(', '));
            break;

        case '/delete':
            if (req.method !== 'DELETE') {
                const errMessage = `HTTP method not allowed`;
                res.writeHead(405);
                res.end(errMessage);
                break;
            }

            const delBody = [];
            let delData = {};

            req.on('data', (data) => {
                delBody.push(data)
            });

            req.on('end', () => {
                delData = JSON.parse(Buffer.concat(delBody).toString());
                console.log(delData);
                if (cookies.authorized === 'true' && +cookies.userId === user.id) {
                    try {
                        fs.unlinkSync(`${__dirname}/files/${delData.filename}`);
                    } catch (err) {
                        console.log('Error deleting file: ', err);
                    }
                }
            });
            res.writeHead(200);
            res.end('Success!');
            break;

        case '/post':
            if (req.method !== 'POST') {
                const errMessage = `HTTP method not allowed`;
                res.writeHead(405);
                res.end(errMessage);
                break;
            }

            const postBody = [];
            let postData = {};

            req.on('data', (data) => {
                postBody.push(data)
            });

            req.on('end', () => {
                postData = JSON.parse(Buffer.concat(postBody).toString());
                console.log(postData);
                if (cookies.authorized === 'true' && +cookies.userId === user.id) {
                    try {
                        fs.appendFileSync(`${__dirname}/files/${postData?.filename}`, postData?.content);
                    } catch (err) {
                        console.log('Error appenging to file: ', err);
                    }
                }
            });
            res.writeHead(200);
            res.end('Success!');
            break;

        case '/redirect':
            if (req.method === 'GET') {
                res.writeHead(301, { Location: '/redirected' }).end();
                break;
            }

        default:
            res.writeHead(404);
            res.end('Not Found!');
            break;
    }
}

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Сервер запущен и доступен по адресу http://${host}:${port}`);
})