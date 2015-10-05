
/**
 * Routes for the user signup flow:
 * - User creates initial information
 * - Email sent with verification code
 * - Verification code sets email to validated state
 */
// http://mcavage.github.io/node-restify/#Content-Negotiation
var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Beta = mongoose.model('Beta')
    , BetaInvite = mongoose.model('BetaInvite')
    , VerifyCode = mongoose.model('VerifyCode')
    , restify = require('restify')
    , ObjectId = mongoose.Types.ObjectId
    , config = require('../config/config').get();

var mail = {};
var gBetaFlag = false;


/**
 * Set config
 * TODO Need to refactor this into one Export with methods and pass the mail into the require('user-signup.js')(mailHelper)
 *
 * @param config
 */
module.exports.setMail=function(mailHelper) {
    mail = mailHelper;
}
/**
 * Check to see if the user signup requires beta codes
 */
module.exports.checkBeta=function(req, res, next) {
    Beta.findOne({}, function (err, beta) {
        if (!err) {
            if (beta) {
                gBetaFlag = beta.status;
            }
            return next();
        } else {
            return next(err);
        }
    });
}

/**
 * If beta active, verify the beta code
 */
module.exports.verifyBeta=function(req, res, next) {
    if (gBetaFlag) {
        if (req.params.betaCode) {
            BetaInvite.findOne({betaCode:req.params.betaCode}, function (err, betaInvite) {
                if (!err) {
                    if (betaInvite) {
                        return next();
                    } else {
                        return next(new restify.MissingParameterError('A valid Beta Code is required for signup.'));
                    }
                } else {
                    return next(err);
                }
            });
        } else {
            return next(new restify.MissingParameterError('Beta Code is required for signup.'));
        }
    } else {
        return next();
    }
}

/**
 * Create a new user model, fill it up and save it to Mongodb
 *
 * @param request
 * {'username':'user2','name':'user2','email':'user2@user2.com','password':'user2','vPassword':'user2', betaCode: <if required>}
 * @param response
 * @param next method
 */
module.exports.postUser=function(req, res, next) {
    if (req.params.password != req.params.vPassword) {
        return next(new restify.MissingParameterError('Password and Verify Password must match.'));
    }
    if(req.params.score){
        delete req.param['score']; //防止恶意修改积分
    }
    /*     if (!mail.validateEmail(req.params.email)) {
     return next(new restify.MissingParameterError('Please enter a valid email address.'));
     }*/
    var user = new User(req.params);
    if (user.role == 'Admin' && !config.openUserSignup) {
        //TODO allow admin to modify create/modify a user with Admin access
        return next(new restify.MissingParameterError('You cannot create an Administrator.'));
    }
    //if (user.username !== null && user.username !== '') { //TODO 这里重复验证，MongoOse Scheme已经有自定义定义验证但required验证在其之前运行，需要调研
    user.save(function (err, user) {
        if (!err) {
            // create a verification code
            mail.generateVerifyCode(req, res, next, user);
            res.send(user);
            return next();
        } else {
            if(err.errors) err.message=JSON.stringify(err.errors);
            return next(err);
        }
    });
    /*      } else {
     return next(new restify.MissingParameterError('Username required.'));
     }*/
}

/**
 * User requests a verification code be resent (account or email)
 *
 * @param request
 * @param response
 * @param next method
 */
module.exports.resendVerifyCode=function(req, res, next) {
    var queryVal = req.params.username;
    if (req.params.email) {
        queryVal = req.params.email;
    }
    if (queryVal) {
        var queryObj;
        if (config.usernameOrPassword) {
            queryObj = {$or :[{'username': new RegExp('^'+queryVal+'$', 'i')}, {'email': new RegExp('^'+queryVal+'$', 'i')}]};
        } else {
            queryObj = {'username': new RegExp('^'+queryVal+'$', 'i')};
        }
        User.findOne(queryObj, function (err, user) {
            if (err) {
                res.send(err);
                return next();
            } else if (!user) {
                return next(new restify.NotAuthorizedError("Invalid username."));
            } else {
                mail.generateVerifyCode(req, res, next, user);
                res.send(user);
                return next();
            }
        });
    }
    else {
        return next(new restify.MissingParameterError('Username or email address required.'));
    }
}

/**
 * Search for existing username
 * https://fabianosoriani.wordpress.com/2012/03/22/mongoose-validate-unique-field-insensitive/
 * @param request ?username=<username>
 * @param response
 * @param next method
 */
module.exports.checkUsername=function(req, res, next) {
    if (req.params.username !== null && req.params.username !== '') {
        var query = User.where( 'username', new RegExp('^'+req.params.username+'$', 'i') );
        query.count(function(err, count) {
            if (!err) {
                if (count === 0) {
                    res.send({});
                    return next();
                } else {
                    return next(new restify.InternalError('Username already in use.'));
                }
            } else {
                var errObj = err;
                if (err.err) { errObj = err.err; }
                return next(new restify.InternalError(errObj.message));
            }
        });
    } else {
        return next(new restify.MissingParameterError('Username required.'));
    }
}

/**
 * Search for existing email
 * https://fabianosoriani.wordpress.com/2012/03/22/mongoose-validate-unique-field-insensitive/
 *
 * @param request ?email=<email address>
 * @param response
 * @param next method
 */
module.exports.checkEmail=function(req, res, next) {
    var queryTxt = req.params.email;
    if (req.params.newEmail && req.params.newEmail !== '') {
        queryTxt = req.params.newEmail;
    }
    if (queryTxt && queryTxt.length > 0) {
        var queryObj;
        queryObj = {$or :[{'email': new RegExp('^'+queryTxt+'$', 'i')}, {'newEmail': new RegExp('^'+queryTxt+'$', 'i')}]};
        User.count(queryObj, function (err, count) {
            if (!err) {
                if (count === 0) {
                    res.send({});
                    return next();
                } else {
                    return next(new restify.InternalError('Email already in use.'));
                }
            } else {
                var errObj = err;
                if (err.err) { errObj = err.err; }
                return next(new restify.InternalError(errObj.message));
            }
        });
    } else {
        res.send({});
        return next();
    }
}

/**
 * User requests a new password
 * @param request
 * @param response
 * @param next method
 */
module.exports.sendNewPassword=function(req, res, next) {
    var queryVal = req.params.username;
    if (req.params.email) {
        queryVal = req.params.email;
    }
    if (queryVal) {
        var newPass = globalUtil.generatePassword();
        var queryObj;
        if (config.usernameOrPassword) {
            queryObj = {$or :[{'username': new RegExp('^'+queryVal+'$', 'i')}, {'email': new RegExp('^'+queryVal+'$', 'i')}]};
        } else {
            queryObj = {'username': new RegExp('^'+queryVal+'$', 'i')};
        }
        User.findOne(queryObj, function (err, user) {
            if (err) {
                res.send(err);
                return next();
            } else if (!user) {
                return next(new restify.NotAuthorizedError("Invalid username."));
            } else {
                user.password = newPass;
                user.tempPasswordFlag = true;
                user.save(function (err, user) {
                    if (!err) {
                        // send the new password
                        var refer = req.toString().substring(req.toString().indexOf('referer:')+8).trim();
                        var protocol = refer.substring(0, refer.indexOf('//') + 2);
                        var referHost = refer.substring(refer.indexOf('//') + 2);

                        referHost = referHost.substring(0, referHost.indexOf('/'));
                        var fullURL = protocol + referHost;
                        var messageBody = "Hello " + user.name + ",</br><p>Here is your new password. Please login and change it.</p><p>" + newPass + "</p>";
                        messageBody = messageBody + "<a href='" + fullURL + "' target='_blank'>Login to your account</a>";

                        var mailAddress = user.email;
                        mail.sendMail(mailAddress, 'Temporary Password Email', messageBody, true);
                        res.send(user);
                        return next();
                    } else {
                        return next(err);
                    }
                });
            }
        });
    } else {
        return next(new restify.MissingParameterError('Username or email address required.'));
    }
}















