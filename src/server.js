const http = require('http');
const app = require('./src/requests');

const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port);

server.once('listening', function()
{
    console.log(`http://localhost:${port}`);
});