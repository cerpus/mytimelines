# MyTimelines

A timeline visualisation service.

## Usage

MyTimelines is known to run well with version 0.10.x of NodeJS.

Install dependencies:

    $ npm install

Build required files:

    $ npm run build

To start the server:

    $ node start

### Tempuhs-Server

MyTimelines will send requests for timespans to `localhost:7070`. If you want
the service to function there should probably be something at that endpoint
which can handle the requests.

## License

This service is AGPL licensed. See [license](LICENSE)
