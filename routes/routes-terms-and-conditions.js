
/**
 * Terms & Conditions Routes Module
 *   Requires authenticated users
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , config_path = config.root + '/config'
    , auth = require(config_path + '/middlewares/authorization.js')
    , termsAndConditionsController= require('../controller/terms-and-conditions');

module.exports = function (app) {


    /**
     * Post a Terms and Conditions message
     *
     * @param path {message : '<message>', subject: '<subject>'}
     * @param promised callback check admin access
     * @param promised 2nd callback post
     */
    app.post('/api/v1/terms', auth.adminAccess, termsAndConditionsController.postTermsAndConditions);

    /**
     * Get a terms & conditions thread
     *
     * @param path {}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.get('/api/v1/terms', auth.requiresLogin, termsAndConditionsController.getTermsAndConditions);

    /**
     * Accept a Terms & Conditions
     *
     * @param path {termsAndConditionsId: '<id>'}
     * @param promised callback check authorization
     * @param promised 2nd callback update
     */
    app.del('/api/v1/terms', auth.requiresLogin, termsAndConditionsController.archiveTermsAndConditions);
};













