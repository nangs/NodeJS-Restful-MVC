
/**
 * User Routes module
 *    these routes require authenticated users
 */
var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , UserList = mongoose.model('UserList')
    , VerifyCode = mongoose.model('VerifyCode')
    , MessageThread = mongoose.model('MessageThread')
    , SystemMessageArchive = mongoose.model('SystemMessageArchive')
    , TermsAndConditionsArchive = mongoose.model('TermsAndConditionsArchive')
    , ObjectId = mongoose.Types.ObjectId
    , restify = require('restify')
    , config = require('../config/config').get()
    , Promise = require('bluebird')
    , Image = mongoose.model('Image');

var gCheckCurrentPassword = true;
var gCheckRoleRestriction = true;
var mail = {};

/**
 * Set config
 * TODO Need to refactor this into one Export with methods and pass the mail into the require('user.js')(mailHelper)
 *
 * @param config
 */
module.exports.setMail=function(mailHelper) {
    mail = mailHelper;
}
/**
 * This function is responsible for searching and returning multiple users
 *
 * @param request includes the fields to create a UserList object
 * @param response contains a populated UserList object
 * @param next method
 */
module.exports.searchUsers=function(req, res, next) {
    var userList = new UserList(req.params);
    var pageNum = userList.pageNumber;
    var itemsPerPage = userList.itemsPerPage;

    if (itemsPerPage <= 0 || pageNum <= 0) {
        itemsPerPage = 999999999999;
        pageNum = 1;
    }
    pageNum = pageNum - 1;

    User.count({}, function(err, count) {
        if (!err) {
            userList.pageCount = Math.ceil(count / itemsPerPage);

            var sortStr = "";
            if (userList.sortField !== null && userList.sortField !== '') {
                if ('false' === userList.ascendingSortFlag) {
                    sortStr = "-" + userList.sortField;
                } else {
                    sortStr = userList.sortField;
                }
            }

            // NOTE This sort query is really inefficient, always queries the three columns
            var query = User.find({ username: { $regex: userList.username, $options: 'imx' }, name: { $regex: userList.name, $options: 'imx' }, email: { $regex: userList.email, $options: 'imx' } });

            // This returns partially populated objects preventing client sessions from seeing too much of the user's info
            // if config settings are set to false, then these fields will be excluded
            if (config.searchSettings.allowEmail) { query.select('email'); }
            if (config.searchSettings.allowName) { query.select('name'); }
            if (config.searchSettings.allowUsername) { query.select('username'); }
            if (config.searchSettings.allowPhoneNumber) { query.select('phoneNumber');}
            if (config.searchSettings.allowRole) {query.select('role');}
            // If all selects are 'false' then all fields come back
            // So explicity select the The Object Id so ONLY the Object Id plus any of the selected fields come back
            query.select('_id');

            if (sortStr.length > 0) {
                query = query.sort(sortStr);
            }
            if (itemsPerPage > 0) {
                query = query.limit(itemsPerPage).skip(itemsPerPage * pageNum);
            }
            query.exec(function(err, users) {
                if (!err) {
                    userList.users = users;
                    // console.log(JSON.stringify(userList))
                    res.send(userList);
                    return next();
                } else {
                    var errObj = err;
                    if (err.err) { errObj = err.err; }
                    return next(errObj);
                }
            });
        } else {
            var errObj = err;
            if (err.err) { errObj = err.err; }
            return next(errObj);
        }
    });
}

/**
 * Gateway request routes to other functions based on params
 * Search for a user by id or username
 * if none given get the logged in user's information
 *
 * @param request can include an id, a username or no search param
 * @param response contains a populated User object
 * @param next method
 */
module.exports.getUser=function(req, res, next) {
    if (req.session && req.session.user) {
        id = req.session.user;
        if (req.params.id) { id = req.params.id; }
        User.findById(id, function (err, user) {
            if (!err) {
                res.send(user);
                return next();
            } else {
                var errObj = err;
                if (err.err) { errObj = err.err; }
                return next(errObj);
            }
        });
    } else {
        return next(new restify.MissingParameterError('No search params sent.'));
    }
}

/**
 * Search for a user by id or username
 *
 * @param request path includes an id or username
 * @param response contains a populated User object
 * @param next method
 */
module.exports.getUserByIdOrUsername=function(req, res, next) {
    var search = req.url;
    search = search.substring(search.lastIndexOf("/")+1);
    if (search !== null && search !== '') {
        var query = User.where( 'username', new RegExp('^'+search+'$', 'i') );
        query.findOne(function (err, user) {
            if (!err) {
                if (user) {
                    res.send(user);
                } else {
                    User.findById(search, function (err, user) {
                        if (!err) {
                            res.send(user);
                        } else {
                            res.send(new restify.ResourceNotFoundError('User not found.'));
                        }
                        return next();
                    });
                }
            } else {
                var errObj = err;
                if (err.err) { errObj = err.err; }
                return next(errObj);
            }
        });
    } else {
        return next(new restify.MissingParameterError('Username or ID required.'));
    }
}

/**
 * Admin: Modify an existing user
 *
 * @param request
 * @param response
 * @param next method
 */
module.exports.putUserByAdmin=function(req, res, next) {
    gCheckCurrentPassword = false;
    gCheckRoleRestriction = false;
    var promise=  new Promise(function(resolve, reject){
        User.findById(req.params.id, function (err, user) {
            if (!err && user) {
                // only change data if submit supplied it
                if (req.params.name) {
                    user.name = req.params.name;
                }
                if (req.params.username) {
                    user.username = req.params.username;
                }
                if (req.params.role) {
                    user.role = req.params.role;
                }
                if (req.params.email) {
                    user.newEmail = req.params.email;
                }
                resolve(user);
            } else {
                reject ( new restify.MissingParameterError('ObjectId required.'));
            }
        });
    });
    return validateAndSaveUser(req, res, next,promise);
}
/**
 * Modify an existing user with matching id
 *
 * @param request
 * @param response
 * @param next method
 */
module.exports.putUser=function(req, res, next) {
    gCheckCurrentPassword = true;
    gCheckRoleRestriction = true;
    var promise= new Promise(function(resolve, reject){
        if (req.params.id == req.session.user) {
            User.findById(req.params.id, function (err, user) {
                if (!err) {
                    // only change data if submit supplied it
                    if (req.params.name) {
                        user.name = req.params.name;
                    }
                    if (req.params.username) {
                        user.username = req.params.username;
                    }
                    if (req.params.email) {
                        user.newEmail = req.params.email;
                    }
                    resolve(user);
                } else {
                    reject ( new restify.MissingParameterError('ObjectId required.'));
                }
            });
        } else {
            reject ( new restify.MissingParameterError('User can only update their own information.'));
        }
    });
    return validateAndSaveUser(req, res, next,promise);
}

/**
 * Validate and save user, after it is modified
 *
 * @param promise
 * @param request
 * @param response
 * @param next method
 */
function validateAndSaveUser(req, res, next,promise) {
    return promise.then(function(user) {
        // validations
        if (req.params.password) {
            if (req.params.password != req.params.vPassword) {
                return Promise.reject ( new restify.MissingParameterError('Password and Verify Password must match.'));
            }
            if (gCheckCurrentPassword && req.params.password && !req.params.cPassword) {
                return Promise.reject ( new restify.MissingParameterError('You must enter your current password to verify.'));
            }
            if (req.params.cPassword) {
                if (!user.authenticate(req.params.cPassword)) {
                    return Promise.reject ( new restify.MissingParameterError('Your current password is invalid.'));
                }
                user.tempPasswordFlag = true;
                user.password = req.params.password;
            }
        }
        return user;
    }).then(function(user) {
        if (req.params.role) {
            user.role = req.params.role;
            if (gCheckRoleRestriction && user.role == 'Admin' && !config.openUserSignup) {
                return Promise.reject ( new restify.MissingParameterError('You cannot change this user to an Administrator.'));
            }
        }
        if (user.newEmail) { // newEmail 未添加唯一性约束
            var queryObj = {$or :[{'email': new RegExp('^'+user.newEmail+'$', 'i')}, {'newEmail': new RegExp('^'+user.newEmail+'$', 'i')}]};
            return new Promise(function(resolve, reject) {
                User.count(queryObj, function (err, count) {
                    if (!err) {
                        if (count === 0) {
                            resolve(user);
                        } else {
                            reject(new restify.MissingParameterError('Email already in use, or you must validate your new email before making more changes to your account.'));
                        }
                    } else {
                        var errObj = err;
                        if (err.err) {
                            errObj = err.err;
                        }
                        reject(new restify.InternalError(errObj.message));
                    }
                });
            });
        } else {
            return user;
        }
    }).then(function(user){
        return new Promise(function(resolve, reject) {
            user.save(function (err) {
                if (!err) {
                    // generate and send a verification code to swap email address
                    if (user.newEmail) {
                        // TODO When messaging is available, add a system message to the user telling them to check their email to verify the email address
                        mail.generateVerifyCodeUpdatedEmail(req, res, next, user);
                    }
                    resolve(user);
                } else {
                    if(err.errors) err.message=JSON.stringify(err.errors);
                    reject(err);
                }
            });
        });
    }).then(function(user){
        res.send(user);
        return next();
    },function(reject){
        return next(reject);
    }).error(function(e){
        return next(new restify.InternalError(e));
    }).catch(function(e){
        return next(new restify.InternalError(e));
    });
}
/**
 * Delete an existing user with matching id
 *
 * @param request
 * @param response
 * @param next method
 */
module.exports.deleteUser=function(req, res, next) {
    if (req.session && req.session.user) {
        if (req.session.user == req.params.id) {
            return next(new restify.InvalidArgumentError('User cannot delete themselves.'));
        }
        User.findById(req.params.id, function (err, user) {
            if (!err) {
                if (user.imageId) {  //如果有则删除对应的图片
                    Image.findById(user.imageId).remove(function (err) {
                        if (!err) {
                            // resolve({});  //图片删除成功
                        } else {
                            var errObj = err;
                            if (err.err) {
                                errObj = err.err;
                            }
                            // reject(errObj); //图片删除失败，指定图片不存在 或者其他原因，需要记入log
                        }
                    });
                }
            }
        }).remove(function (err) {
            if (!err) {
                // clean up archived status
                var query = SystemMessageArchive.where( 'userId', req.params.id );
                query.exec(function (err, sysMessageArr) {
                });
                var query2 = TermsAndConditionsArchive.where( 'userId', req.params.id );
                query2.exec(function (err, sysMessageArr) {
                });

                res.send({});
                return next();
            } else {
                return next(new restify.MissingParameterError('ObjectId required.'));
            }
        });
    }
}

/**
 * create or update an image for current user
 *
 * @param request
 * @param response
 * @param next method
 */
module.exports.putImage=function(req, res, next) {
    return new Promise(function(resolve, reject){
        if (req.params.id == req.session.user) {
            if (req.params.image) {

                User.findById(req.params.id, function (err, user) {
                    if (!err) {
                        resolve(user);
                    } else {
                        reject (new restify.MissingParameterError('ObjectId required.'));
                    }
                });
            }else{
                reject (new restify.MissingParameterError('Please update an image'));
            }
        } else {
            reject (new restify.MissingParameterError('User can only update their own information.'));
        }
    }).then(function(user){
            // only change data if submit supplied it
            var split = req.params.image.split('base64,');
            var type = split[0].split('data:')[1];
            type = type.substring(0, type.length - 1);//获得文件类型如:image/jpeg
            var data = new Buffer(split[1], 'base64');
            if (user.imageId) {// 已经存在图片，更新
                return new Promise(function(resolve, reject){
                    Image.findById(user.imageId, function (err, image) {
                        if (!err) {
                            image.img.data = data;
                            image.img.contentType = type;
                            resolve( {image:image,user:user});
                        } else {
                            reject (new restify.MissingParameterError('Did not find the image with specified id.'));
                        }
                    });
                });
            } else { //图片不存在，创建新图片，并更新User.imageId
                var image = new Image({img: {data: data, contentType: type}}); // 必须是png格式
                return {image:image,user:user};
            }
        }).then(function(collection){
            return new Promise(function(resolve, reject){
                collection.image.save(function (err) {
                    if (!err) {
                        // 图片保存成功，则更新UserImageId属性
                        collection.user.imageId=collection.image._id;
                        resolve(collection.user);
                    } else {
                        if(err.errors) err.message=JSON.stringify(err.errors);
                        reject(err);
                    }
                });
            });
        }).then(function(user){
            return new Promise(function(resolve, reject){
                user.save(function (err) {
                    if (!err) {
                        resolve(user);
                    } else {
                        if(err.errors) err.message=JSON.stringify(err.errors);
                        reject(err);
                    }
                });
            });
        }).then(function(user){
            res.send(user);
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}


