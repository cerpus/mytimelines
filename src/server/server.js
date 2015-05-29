var Hapi = require('hapi');
var og   = require('open-graph');

var server = new Hapi.Server();

server.connection({
    port : 3000,
    host : 'localhost'
});

server.route({
    method  : 'POST',
    path    : '/api/opengraph',
    handler : function (request, reply) {
        og(request.payload.url, function (err, meta) {
            if (err) { reply(err); }

            reply(meta);
        });
    }
});

server.route({
    method  : '*',
    path    : '/api/{path*}',
    handler : {
        proxy : {
            passThrough : true,
            mapUri      : function (request, callback) {
                var baseUri        = 'http://localhost:7070';
                var requestUri     = request.url.path.replace('/api', '');
                var destinationUri = baseUri + requestUri;

                console.log('Proxying to:', destinationUri);
                callback(null, destinationUri);
            }
        }
    }
});

server.route({
    method  : 'GET',
    path    : '/public/{file*}',
    handler : {
        directory : {
            path : __dirname + '/../../public/'
        }
    }
});

server.route({
    method  : '*',
    path    : '/{path*}',
    handler : function (request, reply) {
        reply.file(__dirname + '/../client/index.html');
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
