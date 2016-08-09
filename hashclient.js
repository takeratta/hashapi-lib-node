/*jslint node: true */
'use strict';

var request = require('request');
var jwt = require('jsonwebtoken');

var API_ROOT = 'https://hashapi.tierion.com';
var API_VERSION = '/v1';
var API_PATH = API_ROOT + API_VERSION;

var HashClient = function (access_token, refresh_token) {
    // in case 'new' was omitted
    if (!(this instanceof HashClient)) {
        return new HashClient(access_token, refresh_token);
    }

    // if access_token and refresh_token are supplied, we ready to go
    // otherwise, user must call authenticate with their Tierion credentials to obtain tokens
    if (access_token && refresh_token) {
        this.authToken = {
            access_token: access_token,
            refresh_token: refresh_token,
            expires: jwt.decode(access_token).exp || 0,
            refreshingToken: false
        };
    }
};

//////////////////////////////////////////
// Public functions
//////////////////////////////////////////

HashClient.prototype.authenticate = function (username, password, callback) {
    var that = this;
    this._getAccessTokenFromCredentials(username, password, function (err, token) {
        if (err) return callback(err);
        that.authToken = {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires: jwt.decode(token.access_token).exp || 0,
            refreshingToken: false
        };
        callback(null, that.authToken);
    });
};

HashClient.prototype.refreshAuthToken = function (callback) {
    var that = this;
    this._getAccessTokenFromRefreshToken(that.authToken.refresh_token, function (err, token) {
        if (err) return callback(err);
        that.authToken = {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires: jwt.decode(token.access_token).exp || 0,
            refreshingToken: false
        };
        callback(null, that.authToken);
    });
};

HashClient.prototype.submitHashItem = function (hash, callback) {
    var parameters = {
        hash: hash
    };
    this._httpPost(API_PATH + '/hashitems', parameters, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

HashClient.prototype.getReceipt = function (id, callback) {
    this._httpGet(API_PATH + '/receipts/' + id, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

HashClient.prototype.getAllBlockSubscriptions = function (callback) {
    this._httpGet(API_PATH + '/blocksubscriptions', function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

HashClient.prototype.getBlockSubscription = function (id, callback) {
    this._httpGet(API_PATH + '/blocksubscriptions/' + id, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

HashClient.prototype.createBlockSubscription = function (parameters, callback) {
    if (typeof parameters === 'string') { // handle legacy case of receiving only callbackUrl string
        parameters = {
            callbackUrl: parameters
        };
    }
    this._httpPost(API_PATH + '/blocksubscriptions', parameters, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

HashClient.prototype.updateBlockSubscription = function (id, parameters, callback) {
    if (typeof parameters === 'string') { // handle legacy case of receiving only callbackUrl string
        parameters = {
            callbackUrl: parameters
        };
    }
    this._httpPut(API_PATH + '/blocksubscriptions/' + id, parameters, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

HashClient.prototype.deleteBlockSubscription = function (id, callback) {
    this._httpDelete(API_PATH + '/blocksubscriptions/' + id, function (err, result) {
        if (err) return callback(err);
        callback(null, result);
    });
};

//////////////////////////////////////////
// Utility functions
//////////////////////////////////////////

HashClient.prototype._httpGet = function (url, callback) {
    var that = this;
    request.get({
        url: url,
        auth: {
            'bearer': this.authToken.access_token || 'none'
        }
    }, function (err, res, body) {
        if (err) return callback(err);
        body = JSON.parse(body);
        if (res.statusCode == 401 && body.error == 'Your access token has expired.') {
            that._getAccessTokenFromRefreshToken(that.authToken.refresh_token, function (err, token) {
                if (err) return callback(err);
                that.authToken = {
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires: jwt.decode(token.access_token).exp || 0,
                    refreshingToken: false
                };
                that._httpGet(url, callback);
            });
        } else {
            if (res.statusCode >= 400) return callback(body);
            callback(null, body);
        }
    });
};

HashClient.prototype._httpPost = function (url, parameters, callback) {
    var that = this;
    request.post({
        url: url,
        auth: {
            'bearer': this.authToken.access_token || 'none'
        },
        json: parameters
    }, function (err, res, body) {
        if (err) return callback(err);
        if (res.statusCode == 401 && body.error == 'Your access token has expired.') {
            that._getAccessTokenFromRefreshToken(that.authToken.refresh_token, function (err, token) {
                if (err) return callback(err);
                that.authToken = {
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires: jwt.decode(token.access_token).exp || 0,
                    refreshingToken: false
                };
                that._httpPost(url, parameters, callback);
            });
        } else {
            if (res.statusCode >= 400) return callback(body);
            callback(null, body);
        }
    });
};

HashClient.prototype._httpPostNoBearer = function (url, parameters, callback) {
    request.post({
        url: url,
        json: parameters
    }, function (err, res, body) {
        if (err) return callback(err);
        if (res.statusCode >= 400) return callback(body);
        callback(null, body);
    });
};

HashClient.prototype._httpPut = function (url, parameters, callback) {
    var that = this;
    request.put({
        url: url,
        auth: {
            'bearer': this.authToken.access_token
        },
        json: parameters
    }, function (err, res, body) {
        if (err) return callback(err);
        if (res.statusCode == 401 && body.error == 'Your access token has expired.') {
            that._getAccessTokenFromRefreshToken(that.authToken.refresh_token, function (err, token) {
                if (err) return callback(err);
                that.authToken = {
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires: jwt.decode(token.access_token).exp || 0,
                    refreshingToken: false
                };
                that._httpPut(url, parameters, callback);
            });
        } else {
            if (res.statusCode >= 400) return callback(body);
            callback(null, body);
        }
    });
};

HashClient.prototype._httpDelete = function (url, callback) {
    var that = this;
    request.delete({
        url: url,
        auth: {
            'bearer': this.authToken.access_token
        }
    }, function (err, res, body) {
        if (err) return callback(err);
        body = JSON.parse(body);
        if (res.statusCode == 401 && body.error == 'Your access token has expired.') {
            that._getAccessTokenFromRefreshToken(that.authToken.refresh_token, function (err, token) {
                if (err) return callback(err);
                that.authToken = {
                    access_token: token.access_token,
                    refresh_token: token.refresh_token,
                    expires: jwt.decode(token.access_token).exp || 0,
                    refreshingToken: false
                };
                that._httpDelete(url, callback);
            });
        } else {
            if (res.statusCode >= 400) return callback(body);
            callback(null, body);
        }
    });
};

HashClient.prototype._getAccessTokenFromCredentials = function (username, password, callback) {
    var parameters = {
        username: username,
        password: password
    };
    this._httpPostNoBearer(API_PATH + '/auth/token', parameters, function (err, authToken) {
        if (err) return callback(err);
        callback(null, authToken);
    });
};

HashClient.prototype._getAccessTokenFromRefreshToken = function (refreshToken, callback) {
    var parameters = {
        refreshToken: refreshToken
    };
    this._httpPostNoBearer(API_PATH + '/auth/refresh', parameters, function (err, authToken) {
        if (err) return callback(err);
        callback(null, authToken);
    });
};

module.exports = HashClient;