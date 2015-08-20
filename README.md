# MyTimelines

A timeline visualisation service.

## Usage

MyTimelines is known to run well with version 0.10.x of NodeJS.

Install dependencies:

    $ npm install

Build required files:

    $ ./node_modules/.bin/gulp

Command can be safely exited after task `default` is finished.

To start the server:

    $ node ./src/server/server.js

### Tempuhs-Server

MyTimelines will send requests for timespans to `localhost:7070`. If you want
the service to function there should probably be something at that endpoint
which can handle the requests.

## License

This service is AGPL licensed. See [license](LICENSE)
