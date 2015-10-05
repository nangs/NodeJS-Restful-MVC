
/**
 * User Routes module
 *    these routes require authenticated users
 */
var restify = require('restify')
    , config = require('../config/config').get()
    , config_path = config.root + '/config'
    , auth = require(config_path + '/middlewares/authorization.js')
    , busController=require('../controller/bus');

module.exports = function (app,redisClient) {

    busController.setClient(redisClient);
    // Set up routes

    // I looked at versioning via header. Lots of arguments pro/con regarding different types of versioning
    // I like the embedded version (self documenting) so stuck with that instead
    // apt.get({path: 'api/user:id', version: '1.0.0'}, getUser_V1);
    // apt.get({path: 'api/user:id', version: '2.0.0'}, getUser_V2);
    //app.get('/api/v1/initNewBusByUser', auth.requiresLogin, busController.initNewBusByUser);

    app.put('/api/v1/initNewBusByUser', busController.initNewBusByUser);
    app.put('/api/v1/initNewBusByDriver', busController.initNewBusByDriver);
    app.put('/api/v1/addNewBus', busController.addNewBus);
    app.put('/api/v1/updateLocation', busController.updateLocation);
    app.get('/api/v1/getLocation', busController.getLocation);
    app.put('/api/v1/updateDriver', busController.updateDriver);
    app.get('/api/v1/getDriverId', busController.getDriverId);
    app.get('/api/v1/getDriverName', busController.getDriverName);
    app.put('/api/v1/addUser', busController.addUser);
};
