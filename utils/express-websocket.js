var http = require('http');
var urlJoin = require('url-join');
var ServerResponse = http.ServerResponse;
var WebSocketServer = require('ws').Server;

var wsServers = {};

/**
 * @param {express.Application} app
 * @param {http.Server} [server]
 */
module.exports = function (app, server) {
    if(!server) {
        server = http.createServer(app);

        app.listen = function()
        {
            return server.listen.apply(server, arguments)
        }
    }

    function addSocketRoute(route, middleware, callback) {
        var args = [].splice.call(arguments, 0);
        var wsPath = urlJoin(app.mountpath, route);

        if (args.length < 2)
            throw new SyntaxError('Invalid number of arguments');

        if (args.length === 2) {
            middleware = [middleware];
        } else if (typeof middleware === 'object') {
            middleware.push(callback);
        } else {
            middleware = args.slice(1);
        }

        var wss = new WebSocketServer({
            server: server,
            path: wsPath
        });

        wsServers[wsPath] = wss;

        wss.on('connection', function(ws) {
            var response = new ServerResponse(ws.upgradeReq);
            response.writeHead = function (statusCode) {
                if (statusCode > 200) ws.close();
            };
            ws.upgradeReq.method = 'ws';

            for(var i = 0 ; i < middleware.length ; i ++){
                var cur = middleware[i];
                cur(ws, ws.upgradeReq);
            }



        });

        return app;
    };

    app.ws = addSocketRoute;

    return {
        app: app,
        getWss: function (route) {
            return wsServers[route];
        }
    };
};
