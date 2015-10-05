
/**
 * Email Routes module
 *    Requires authenticated users
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , config_path = config.root + '/config'
    , auth = require(config_path + '/middlewares/authorization.js')
    , emailController= require('../controller/email');


module.exports = function (app, mailHelper) {


    emailController.setMail(mailHelper);
    // Set up routes

    // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
    // I like the embedded version (self documenting) so stuck with that instead
    // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
    // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);


    /**
     * Create an email
     *
     * @param path {to:'email destination', 'subject:'<subject>',message'<text>'}
     * @param promised callback
     * @param promised 2nd callback
     */
    app.post('/api/v1/email', auth.requiresLogin, emailController.postEmail);

};

