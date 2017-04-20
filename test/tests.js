/* global describe, it  */

var expect = require('chai').expect

var HashClient = require('../hashclient.js')
var config = require('./config.json')

var accessToken = config.access_token
var refreshToken = config.refresh_token
var username = config.username
var password = config.password

describe('Authentication', function () {
  describe('No token parameters ', function () {
    it('authToken object undefined', function (done) {
      var hashClient = new HashClient()
      expect(hashClient.authToken).to.equal(undefined)
      done()
    })
  })

  describe('Missing refresh token ', function () {
    it('authToken object undefined', function (done) {
      var hashClient = new HashClient(accessToken)
      expect(hashClient.authToken).to.equal(undefined)
      done()
    })
  })

  describe('Using token parameters ', function () {
    it('should initialize authToken object', function (done) {
      var hashClient = new HashClient(accessToken, refreshToken)
      expect(hashClient.authToken.access_token).to.equal(accessToken)
      expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
      expect(hashClient.authToken.expires).to.equal(1469134464)
      expect(hashClient.authToken.refreshingToken).to.equal(false)
      done()
    })
  })

  describe('Using username and password ', function () {
    it('should return a valid authToken object', function (done) {
      var hashClient = new HashClient()
      hashClient.authenticate(username, password, function (err, result) {
        if (err) return done(err)
        expect(result).to.have.property('access_token').and.to.be.a('string')
        expect(result).to.have.property('refresh_token').and.to.be.a('string')
        expect(result).to.have.property('expires').and.to.be.above(Math.round(new Date().getTime() / 1000))
        expect(result).to.have.property('refreshingToken').and.to.equal(false)
        done()
      })
    })
  })

  describe('Using old access_token ', function () {
    it('should auto retrieve new access token using refresh token for POSTs', function (done) {
      var hashClient = new HashClient(accessToken, refreshToken)
      expect(hashClient.authToken.access_token).to.equal(accessToken)
      expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
      hashClient.submitHashItem('badhash', function (err, result) {
        expect(hashClient.authToken.access_token).to.not.equal(accessToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(hashClient.authToken).to.have.property('expires').and.to.be.above(Math.round(new Date().getTime() / 1000))
        expect(hashClient.authToken).to.have.property('refreshingToken').and.to.equal(false)
        expect(err).to.have.property('error').and.to.equal('Parameter \'hash\' must be a valid SHA-256 hash.')
        done()
      })
    })
    it('should auto retrieve new access token using refresh token for GETs', function (done) {
      var hashClient = new HashClient(accessToken, refreshToken)
      expect(hashClient.authToken.access_token).to.equal(accessToken)
      expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
      hashClient.getBlockSubscription('badid', function (err, result) {
        expect(hashClient.authToken.access_token).to.not.equal(accessToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(hashClient.authToken).to.have.property('expires').and.to.be.above(Math.round(new Date().getTime() / 1000))
        expect(hashClient.authToken).to.have.property('refreshingToken').and.to.equal(false)
        expect(err).to.have.property('error').and.to.equal('The request is invalid.')
        done()
      })
    })
    it('should auto retrieve new access token using refresh token for PUTs', function (done) {
      var hashClient = new HashClient(accessToken, refreshToken)
      expect(hashClient.authToken.access_token).to.equal(accessToken)
      expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
      hashClient.updateBlockSubscription('badid', 'badurl', function (err, result) {
        expect(hashClient.authToken.access_token).to.not.equal(accessToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(hashClient.authToken).to.have.property('expires').and.to.be.above(Math.round(new Date().getTime() / 1000))
        expect(hashClient.authToken).to.have.property('refreshingToken').and.to.equal(false)
        expect(err).to.have.property('error').and.to.equal('The request is invalid.')
        done()
      })
    })
    var newAccessToken
    it('should auto retrieve new access token using refresh token for DELETEs', function (done) {
      var hashClient = new HashClient(accessToken, refreshToken)
      expect(hashClient.authToken.access_token).to.equal(accessToken)
      expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
      hashClient.deleteBlockSubscription('badid', function (err, result) {
        expect(hashClient.authToken.access_token).to.not.equal(accessToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(err).to.have.property('error').and.to.equal('The request is invalid.')
        newAccessToken = hashClient.authToken.access_token
        done()
      })
    })
    it('and the new access_token should continue to work', function (done) {
      var hashClient = new HashClient(newAccessToken, refreshToken)
      expect(hashClient.authToken.access_token).to.equal(newAccessToken)
      expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
      hashClient.deleteBlockSubscription('badid', function (err, result) {
        expect(hashClient.authToken.access_token).to.equal(newAccessToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(hashClient.authToken.refresh_token).to.equal(refreshToken)
        expect(hashClient.authToken).to.have.property('expires').and.to.be.above(Math.round(new Date().getTime() / 1000))
        expect(hashClient.authToken).to.have.property('refreshingToken').and.to.equal(false)
        expect(err).to.have.property('error').and.to.equal('The request is invalid.')
        newAccessToken = hashClient.authToken.access_token
        done()
      })
    })
  })
})
