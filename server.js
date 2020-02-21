const http = require('http');
const app = require('./requests');

const server = http.createServer(app);

const port = process.env.PORT || 8000;
server.listen(port);

server.once('listening', function()
{
    console.log(`http://localhost:${port}`);
});