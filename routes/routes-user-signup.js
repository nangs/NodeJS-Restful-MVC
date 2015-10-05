
/**
 * Routes for the user signup flow:
 * - User creates initial information
 * - Email sent with verification code
 * - Verification code sets email to validated state
 */
// http://mcavage.github.io/node-restify/#Content-Negotiation
var restify = require('restify')
    , userSignupController= require('../controller/user-signup');;



module.exports = function (app, mailHelper) {

    userSignupController.setMail(mailHelper);
    // Set up routes
    /**
     * Create a user
     *
     * @param path
     * @param promised callback
     */
    app.post('/api/v1/user', userSignupController.checkBeta, userSignupController.verifyBeta, userSignupController.postUser);

    /**
     * Search for username
     *
     * @param path
     * @param promised callback
     */
    app.get('/api/v1/user/username/exists', userSignupController.checkUsername);

    /**
     * Search for email
     *
     * @param path
     * @param promised callback
     */
    app.get('/api/v1/user/email/exists', userSignupController.checkEmail);


    /**
     * resend the verification link
     *  API-wise this makes more sense in routes-auth.js, but functionally it works better here
     *  maybe put common JS in a require('utility') module?
     *  resend the verify link
     *
     * @param path
     * @param promised callback
     */
    app.get('/api/v1/verify/resend', userSignupController.resendVerifyCode);

    /**
     * Setup a temporary password
     *
     * @param path
     * @param promised callback
     */
    app.get('/api/v1/password/sendNew', userSignupController.sendNewPassword);

};













