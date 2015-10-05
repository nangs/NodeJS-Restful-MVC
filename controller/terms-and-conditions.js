
/**
 * Terms & Conditions Routes Module
 *   Requires authenticated users
 */
var mongoose = require('mongoose')
    , TermsAndConditions = mongoose.model('TermsAndConditions')
    , TermsAndConditionsArchive = mongoose.model('TermsAndConditionsArchive')
    , User = mongoose.model('User')
    , ObjectId = mongoose.Types.ObjectId
    , restify = require('restify');


/**
 * Post a terms & conditions message
 *
 * @param request include subject and message
 * @param response
 * @param next method
 */
module.exports.postTermsAndConditions=function(req, res, next) {
    if (req.session && req.session.user) {
        if (!req.params.message) {
            return next(new restify.MissingParameterError('You must enter a message.'));
        }
        if (!req.params.subject) {
            return next(new restify.MissingParameterError('You must enter a subject.'));
        }
        var termsAndConditions = new TermsAndConditions(req.params);
        termsAndConditions.createDate = new Date();
        termsAndConditions.fromUserId = req.session.user;

        id = req.session.user;
        User.findById(id, function (err, user) {
            if (!err) {
                termsAndConditions.fromUsername = user.username;
                termsAndConditions.save(function (err, termsAndConditionsResult) {
                    if (!err) {
                        res.send({});
                    } else {
                        return next(err);
                    }
                });
            } else {
                var errObj = err;
                if (err.err) { errObj = err.err; }
                return next(new restify.InternalError(errObj.message));
            }
        });
    }
}

/**
 * Get a terms and conditions messages
 *
 * @param request filter (optional) archiveFlag if true includes all
 * @param response array of TermsAndConditionss
 * @param next method
 */
module.exports.getTermsAndConditions=function(req, res, next) {
    if (req.session && req.session.user) {

        /* Here's an example where Mongoose/Mongo becomes hard. I'd like to something like this (psuedo SQL, not sure this is correct but give the gist):
         SELECT * FROM TermsAndConditions A WHERE
         A._id NOT IN (SELECT termsAndConditionsId from TermsAndConditionsArchive B WHERE B.UserId == req.session.user)

         Maybe something like this????
         http://stackoverflow.com/questions/13279992/complex-mongodb-query-with-multiple-or/13280188#comment18104912_13280188

         Maybe look at 'mongoose-joins' module?
         */

        // retrieve all the archive flags for this user then filter
        var query = TermsAndConditionsArchive.where( 'userId', req.session.user );
        query.find(function (err, termsAndConditionsArchive) {
            if (!err) {
                // console.log(JSON.stringify(termsAndConditionsArchive))
                filterTermsAndConditions(req, res, termsAndConditionsArchive, req.params.archiveFlag, next);
            } else {
                var errObj = err;
                if (err.err) { errObj = err.err; }
                return next(new restify.InternalError(errObj.message));
            }
        });

    }
}
/**
 * Filter the system messages and return
 *
 * @param request filter (optional) archiveFlag if true includes all
 * @param response array of TermsAndConditionss
 * @param next method
 */
module.exports.filterTermsAndConditions=function(req, res, termsAndConditionsArchiveArr, archiveFlag, next) {
    TermsAndConditions.find(function (err, termsAndConditionsArr) {
        if (termsAndConditionsArr) {
            if (termsAndConditionsArchiveArr) {
                // going to be SLOW so admins need to keep the message count low and purge them when done
                for (var i = termsAndConditionsArr.length-1; i >= 0; i--) {
                    for (var j = 0; j < termsAndConditionsArchiveArr.length; j++) {
                        if (termsAndConditionsArr[i]._id.toString() == termsAndConditionsArchiveArr[j].termsAndConditionsId.toString()) {
                            if (archiveFlag == 'true' && termsAndConditionsArchiveArr[j].acceptedDate) {
                                termsAndConditionsArr[i].acceptedDate = termsAndConditionsArchiveArr[j].acceptedDate;
                            } else {
                                termsAndConditionsArr.splice(i, 1);
                            }
                            j = termsAndConditionsArchiveArr.length;
                        }
                    }
                }
            }
            res.send(termsAndConditionsArr);
        } else {
            res.send({});
            return next();
        }
    });
}
/**
 * Archive a system messages
 *
 * @param request input termsAndConditionsId
 * @param response
 * @param next method
 */
module.exports.archiveTermsAndConditions=function(req, res, next) {
    if (req.session && req.session.user) {
        if (!req.params.termsAndConditionsId) {
            return next(new restify.MissingParameterError('You must enter a System Message Id.'));
        }

        // avoid creating duplicate entries
        // check if user already archived this message
        // this shouldn't be necessary but my test UI allows the user to retry archiving
        // since the overhead of
        var query = TermsAndConditionsArchive.where( 'termsAndConditionsId', req.params.termsAndConditionsId ).where( 'userId', req.session.user );
        query.count(function (err, count) {
            if (!err) {
                if (count === 0) {
                    var termsAndConditionsArchive = new TermsAndConditionsArchive(req.params);
                    termsAndConditionsArchive.userId = req.session.user;
                    termsAndConditionsArchive.acceptedDate = new Date();
                    termsAndConditionsArchive.save(function (err, termsAndConditions) {
                        if (!err) {
                            res.send({});
                        } else {
                            return next(err);
                        }
                    });
                } else {
                    // already archived
                    res.send({});
                }
            } else {
                var errObj = err;
                if (err.err) { errObj = err.err; }
                return next(new restify.InternalError(errObj.message));
            }
        });

    }
}















