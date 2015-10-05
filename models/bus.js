/**
 * Created by rainbow on 15-7-4.
 */
var Promise = require('bluebird');

/*var redis = require("redis")
 , config = require('./config').get();
 client = redis.createClient(6379, '127.0.0.1', {})
 //client = redis.createClient(config.redis_port, config.redis_host, {})
 // if you'd like to select database 3, instead of 0 (default), call
 // client.select(3, function() { *//* ... *//* });
 client.info(function(err,response){
 console.log(err,response);
 });
 client.on("error", function (err) {
 console.log("Redis Error " + err);
 });*/
/**
 * Set config
 * TODO Need to refactor this into one Export with methods and pass the mail into the require('bus.js')(client)
 *
 * @param config
 */

module.exports.initNewBusByDriver=function(city,busname,location,driverId,driverName,client){
    return new Promise(function(resolve, reject) {
        client.incr(city+":"+busname+":count", function(err, reply) { //如果incr后键值未创建，则会先创建帮初始化为0
            client.multi()
                .set(city+":"+busname+":"+reply+":localtion", JSON.stringify(location))
                .set(city+":"+busname+":"+reply+":DriverId",driverId)
                .set(city+":"+busname+":"+reply+":DriverName",driverName)
                .exec(function(err){
                    if(err === null){
                        console.log("Redis sucess");
                        resolve({});
                    }else{
                        console.log("Redis Error " + err);
                        reject(err);
                    }
                });
        });
    });
}



module.exports.getBus=function(city,busname,id,client){
    return new Promise(function(resolve, reject) {
        client.get(city+":"+busname+":"+id+":DriverId", function (err, reply) {
            if(reply) {
                console.log('I live: ' + reply.toString());
                resolve(reply);
            } else {
                console.log("Redis Error " + err);
                reject(err);
            }
        });
    });
}

module.exports.initNewBusByUser=function(city,busname,lat,lng,user,client){
    return new Promise(function(resolve, reject) {
        client.multi()
            .set(city+":"+busname+":count",0)
            .geoadd(city+":"+busname+":0:localtion", lat,lng)
            .sadd(city+":"+busname+":0:user",user)
            .exec(function(err){
                if(err === null){
                    console.log("sucess");
                    resolve({});
                }else{
                    console.log("Redis Error " + err);
                    reject(err);
                }
            });
    });
}


module.exports.addNewBus=function(city,busname,location,user,client){
    return new Promise(function(resolve, reject) {
        client.incr(city+":"+busname+":count", function(err, reply) {
            client.multi()
                .set(city+":"+busname+":"+reply+":localtion", JSON.stringify(location))
                .sadd(city+":"+busname+":"+reply+":user",user)
                .exec(function(err){
                    if(err === null){
                        console.log("sucess");
                        resolve({});
                    }else{
                        console.log("Redis Error " + err);
                        reject(err);
                    }
                });
        });
    });
}

module.exports.updateLocation=function(city,busname,id,location,client){
    return new Promise(function(resolve, reject) {
        client.set(city+":"+busname+":"+id+":localtion", JSON.stringify(location), function (err, reply) {
            if(reply) {
                console.log( reply.toString());
                resolve(reply);
            } else {
                console.log("Redis Error " + err);
                reject(err);
            }
        });
    });
}

module.exports.getLocation=function(city,busname,id,client){
    return new Promise(function(resolve, reject) {
        client.get(city+":"+busname+":"+id+":localtion", function (err, reply) {
            if(reply) {
                console.log('I live: ' + reply.toString());
                resolve(reply);
            } else {
                console.log("Redis Error " + err);
                reject(err);
            }
        });
    });
}

module.exports.updateDriver=function(city,busname,id,driverId,driverName,client){
    return new Promise(function(resolve, reject) {
        client.multi()
            .set(city+":"+busname+":"+id+":DriverId", driverId)
            .set(city+":"+busname+":"+id+":DriverName", driverName)
            .exec(function(err){
                if(err === null){
                    console.log("sucess");
                    resolve({});
                }else{
                    console.log("Redis Error " + err);
                    reject(err);
                }
            });
    });
}

module.exports.getDriverId=function(city,busname,id,client){
    return new Promise(function(resolve, reject) {
        client.get(city+":"+busname+":"+id+":DriverId", function (err, reply) {
            if(reply) {
                console.log('I live: ' + reply.toString());
                resolve(reply);
            } else {
                console.log("Redis Error " + err);
                reject(err);
            }
        });
    });
}

module.exports.getDriverName=function(city,busname,id,client){
    return new Promise(function(resolve, reject) {
        client.get(city+":"+busname+":"+id+":DriverName", function (err, reply) {
            if(reply) {
                console.log('I live: ' + reply.toString());
                resolve(reply);
            } else {
                console.log("Redis Error " + err);
                reject(err);
            }
        });
    });
}

module.exports.addUser=function(city,busname,id,userId,client){
    return new Promise(function(resolve, reject) {
        client.sadd(city+":"+busname+":"+id+":user", userId, function (err, reply) {
            if(reply) {
                console.log('I live: ' + reply.toString());
                resolve(reply);
            } else {
                console.log("Redis Error " + err);
                reject(err);
            }
        });
    });
}