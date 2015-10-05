
/**
 * Beta test Routes Module
 *   Requires authenticated users, for some the Administrator
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , config_path = config.root + '/config'
    , auth = require(config_path + '/middlewares/authorization.js')
    , betaTestModeController= require('../controller/beta-test-mode');


module.exports = function (app, mailHelper) {

    betaTestModeController.setMail(mailHelper);

    /**
     * Post a Beta Invite
     *
     * @param path {email : 'email address' }
     * @param promised callback check admin access
     * @param promised 2nd callback post
     */
    app.post('/api/v1/beta', auth.adminAccess, betaTestModeController.postBetaInvite);

    /**
     * Turn beta mode on/off using 'status'
     *
     * @param path {status: true|false}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.put('/api/v1/beta', auth.adminAccess, betaTestModeController.putBetaStatus);

    /**
     * Get a Beta status, if betaCode is included return registered email or throw exception
     *
     * @param path {}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.get('/api/v1/beta', betaTestModeController.getBetaStatus);

    /**
     * clear a used betaCode
     *
     * @param path {betaCode:'code'}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.del('/api/v1/beta', auth.requiresLogin, betaTestModeController.deleteBetaInvite);

};





















