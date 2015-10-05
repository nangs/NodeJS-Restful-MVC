
/**
 * Routes module for authorized (secured) access
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , config_path = config.root + '/config'
    , auth = require(config_path + '/middlewares/authorization.js')
    , authController= require('../controller/auth');

module.exports = function (app) {

    // Set up routes

    /**
     * Ping but with user authentication
     *
     * @param path
     * @param promised callback
     * @param request
     * @param response
     */
    app.get('/api/auth', auth.requiresLogin, function (req, res) {
        res.send({'message':'Success'});
    });

    /**
     * Login request
     *
     * @param path
     * @param promised callback
     */
    app.post('/api/v1/session/login', authController.login, authController.checkAdminLoginAccess, authController.accessAllowed);

    /**
     * Logout request
     *
     * @param path
     * @param promised callback
     */
    app.get('/api/v1/session/logout', authController.logout);

    /**
     * Get the available roles
     *
     * @param path
     * @param promised callback
     */
    app.get('/api/v1/roles', authController.roles);

    /**
     * User clicked on the verification link
     *
     * @param path
     * @param promised callback
     */
    app.get('/api/v1/verify', authController.verifyCode);

    /**
     * Check user access
     *
     * @param path
     * @param promised callback
     * @param request
     * @param response
     */
    app.get('/api/v1/roles/access', auth.access, function (req, res) {
        res.send({'message':'Success'});
    });

    /**
     * Ping the server, retrieve the session timeout
     *
     * @param path
     * @param request
     * @param response
     */
    app.get('/api/v1/timeout', auth.requiresLogin, function (req, res) {
        res.send({'message':'Success', 'timeout':config.session_timeout});
    });
};





