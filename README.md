# Inside out of promise
This repository contains code possible implementation of polyfill of promise. It gives you an opportunity to view possible logic and code would be running behind the scene of Promise functionality of javascript.
It is also a favorite question of top level companies interviewers

## Supported promise features with this polyfill
* **One time resolve/reject** It follows principle of promise can be resolved only once. Multiple resolve/reject will simply be ignored.
* **then** It supports then block of promise having two methods for resolve and reject
* **catch** Polyfill implementation also supports this block and it will be executed on event of failure of promise which doesn't have rejection block.
* **Promise Chaining** This polyfill returns promise from its then and catch block which enable chaining of promises
```typescript
promise.then(..).then(..).catch(..).then(..)
```
## Running application
* `npm install`
* `npm run execute`