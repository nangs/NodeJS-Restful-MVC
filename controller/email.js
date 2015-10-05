
/**
* Email Routes module
*    Requires authenticated users
*/
var restify = require('restify');
var mail = {};

/**
 * Set config
 * TODO Need to refactor this into one Export with methods and pass the mail into the require('email.js')(mailHelper)
 *
 * @param config
 */
module.exports.setMail=function(mailHelper) {
    mail = mailHelper;
}

  /**
   * Send an email, this function is more for testing than anything else
   *
   * @param request
   * @param response
   * @param next method
   */
    module.exports.postEmail=function(req, res, next) {
      var to = req.params.to;
      var subject = req.params.subject;
      var message = req.params.message;
      mail.sendMail(to, subject, message, false);
      return next();
   }

