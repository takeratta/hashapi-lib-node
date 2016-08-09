# hashapi-lib-node

[![npm](https://img.shields.io/npm/l/hashapi-lib-node.svg)](https://www.npmjs.com/package/hashapi-lib-node)
[![npm](https://img.shields.io/npm/v/hashapi-lib-node.svg)](https://www.npmjs.com/package/hashapi-lib-node)

Tierion Hash API client library for Node.js

### Installation

```
$ npm install --save hashapi-lib-node
```

### Authenticate

You may either create a HashClient object with token values you've already received, or you may authenticate using your Tierion credentials. In both cases, tokens will refresh automatically when they expire.

To use token values you have already received to create a HashClient object:
```js
var hashclient = require('hashapi-lib-node');

var access_token = 'your_access_token_here';
var refresh_token = 'your_refresh_token_here';
var hashClient = new hashclient(access_token, refresh_token);
```
To create a HashClient object and authenticate with your Tierion username and password:
```js
var hashclient = require('hashapi-lib-node');

var username = 'your_username_here';
var password = 'your_password_here';
var hashClient = new hashclient();

hashClient.authenticate(username, password, function(err, authToken){
    if(err) {
        // handle the error
    } else {
        // authentication was successful
        // access_token, refresh_token are returned in authToken
        // authToken values are saved internally and managed autmatically for the life of the HashClient 
    }
});
```

Once authenticated, you may choose to manually refresh your access token instead of waiting for the client to auto refresh.
```js
hashClient.refreshAuthToken(function(err, authToken){
    if(err) {
        // handle the error
    } else {
        // refresh was successful
    }
});
```

### Usage

This library contains a function for each Tierion Hash API endpoint. Each function will return the JSON result for each endpoint as defined in the Hash API documentation at https://tierion.com/docs/hashapi.

####HashItems

```js
hashClient.submitHashItem(hash, function(err, result){
    if(err) {
        // handle the error
    } else {
        // process result
    }
});
```

####Receipts

```js
hashClient.getReceipt(id, function(err, result){
    if(err) {
        // handle the error
    } else {
        // process result
    }
});
```

####BlockSubscriptions

```js
hashClient.getAllBlockSubscriptions(function(err, result){
    if(err) {
        // handle the error
    } else {
        // process result
    }
});
```

```js
hashClient.getBlockSubscription(id, function(err, result){
    if(err) {
        // handle the error
    } else {
        // process result
    }
});
```

```js
// parameters variable is an object with up to two elements ->
// callbackUrl - REQUIRED - Your url endpoint for the block subscription callback
// label - OPTIONAL - Label used for your own reference
hashClient.createBlockSubscription(parameters, function(err, result){
    if(err) {
        // handle the error
    } else {
        // process result
    }
});
```

```js
// parameters variable is an object with up to two elements ->
// callbackUrl - OPTIONAL - Set to update callbackUrl value
// label - OPTIONAL - Set to update label value
hashClient.updateBlockSubscription(id, parameters, function(err, result){
    if(err) {
        // handle the error
    } else {
        // process result
    }
});
```

```js
hashClient.deleteBlockSubscription(id, function(err, result){
    if(err) {
        // handle the error
    } else {
        // process result
    }
});
```
