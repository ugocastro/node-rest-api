# REST API with NodeJS

This project consists of a **REST API** using _NodeJS_ to provide information about **Super Heroes Catalog** through it's endpoints. It handles CRUD operations of _super heroes_, their _super powers_, _protection area_ and the users that can access the endpoints (based on _authentication_ and _authorization_ mechanisms).

## Summary
* [Requirements](#requirements)
* [Install](#install)
* [How to use](#how-to-use)
  * [Execute](#execute)
  * [Test](#test)
  * [Coverage](#coverage)
* [License](#license)

## Requirements
That's required to install the following dependencies:
 * NodeJS v6.10.1;
 * npm v4.5.0;
 * MongoDB v3.4.3;

## Install
Follow the steps bellow to clone and install project dependencies:
```
$ git clone git@github.com:ugocastro/node-rest-api.git
$ cd node-rest-api/
$ npm install
```

## How to use
Verify if _MongoDB_ is running before starting the application.
<p>Execute the following commands on project's folder.

### Execute
Execute the following command:
```
$ npm start
```
Press `Ctrl+C` to stop running the application.

> **Notes:** The application will be hosted at *http://127.0.0.1:3000/*.

### Test
Execute the following command:
```
$ npm test
```

### Coverage
In order to execute code coverage, please execute:
```
$ npm run coverage
```

> **Notes:** This tasks executes `nyc` to obtain code coverage.
> Coverage is shown on command line and also an HTML file is generated at `${PROJECT_ROOT_DIR}/coverage/index.html`.

## License
MIT.
