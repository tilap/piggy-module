piggy-module [![NPM version][npm-image]][npm-url] [![NPM version][doc-image]][doc-url] 
============================

_This project is a work in progress and not to use in production._

**Piggy-module** is a bunch of class to bind business work to technical storages.

It comes with the following extendable classes:
- **Service**: business interface (the only one to use from "controllers"). Can trigger action to other services.
- **Manager**: manage **its** associated Value Object. Called by the Service, trigger validation and translate the Vo as data to send to the Storage.
- **Storage**: extends AbstractStorage, and deel with basic data storage action (crud).
- **Vo**: The business object itself _maybe should be named DTO instead of Value Object_

A **business package** is a bunch of all of that classes, with a configuration file describing the object properties / validations.

The code documentation is available [here](https://doc.esdoc.org/github.com/tilap/piggy-module/)

_I will complete that file once it a stable enough_

## Developer

Installing dev dependencies, you get the following make commands
- `make build` or `make b` to transpile src to lib
- `make watch` or `make w` to start watching the src and automatically transpile files
- `make clean` or `make c` to clean the lib directory

And to make ease, you can use `make cbw` that run clean, build then watch.

Linting can be done by running `npm lint`.

[npm-image]: https://img.shields.io/npm/v/piggy-module.svg?style=flat
[npm-url]: https://npmjs.org/package/piggy-module
[doc-image]: https://doc.esdoc.org/github.com/tilap/piggy-module/badge.svg
[doc-url]: https://doc.esdoc.org/github.com/tilap/piggy-module/
