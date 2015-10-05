
/**
 * Bus controller module
 *    these routes require authenticated users
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , bus = require('../models/bus');

var redisClient;

module.exports.setClient=function(Client) {
    redisClient = Client;
}

/**
 * This function is responsible for searching and returning multiple users
 *
 * @param request includes the fields to create a UserList object
 * @param response contains a populated UserList object
 * @param next method
 */

module.exports.initNewBusByDriver=function(req, res, next) {
    bus.initNewBusByDriver(req.params.city,req.params.busname,req.params.location,req.params.driverId,req.params.driverName,redisClient)
        .then(function(result){
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}

module.exports.updateBus=function(req, res, next) {
    //bus.getBus(req.params.city,req.param.busName,)
}




module.exports.initNewBusByUser=function(req, res, next) {
    bus.initNewBusByUser(city,busname,location,user,redisClient)
        .then(function(result){
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}



module.exports.addNewBus=function(req, res, next) {
    bus.addNewBus(city,busname,location,user,redisClient)
        .then(function(result){
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}

module.exports.updateLocation=function(req, res, next) {
    bus.updateLocation(city,busname,id,location,redisClient)
        .then(function(result){
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}

module.exports.getLocation=function(req, res, next) {
    bus.getLocation(city,busname,id,redisClient)
        .then(function(result){
        res.send(result);
        return next();
    },function(reject){
        return next(reject);
    }).error(function(e){
        return next(new restify.InternalError(e));
    }).catch(function(e){
        return next(new restify.InternalError(e));
    });
}

module.exports.updateDriver=function(req, res, next) {
    bus.updateDriver(city,busname,id,driverId,driverName,redisClient)
        .then(function(result){
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}

module.exports.getDriverId=function(req, res, next) {
    bus.getDriverId(city,busname,id,redisClient)
        .then(function(result){
            res.send(result);
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}

module.exports.getDriverName=function(req, res, next) {
    bus.getDriverName(city,busname,id,redisClient)
        .then(function(result){
            res.send(result);
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}

module.exports.addUser=function(req, res, next) {
    bus.addUser(city,busname,id,userId,redisClient)
        .then(function(result){
            return next();
        },function(reject){
            return next(reject);
        }).error(function(e){
            return next(new restify.InternalError(e));
        }).catch(function(e){
            return next(new restify.InternalError(e));
        });
}