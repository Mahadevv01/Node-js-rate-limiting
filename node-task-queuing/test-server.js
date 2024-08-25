const http = require('http');
const port = 3000;

const requestListener = (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Server is working\n');
};

const server = http.createServer(requestListener);
server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}/`);
});
