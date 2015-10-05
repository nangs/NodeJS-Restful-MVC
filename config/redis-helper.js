/**
 * Created by rainbow on 15-7-4.
 *//*

var redis = require("redis")
    , config = require('./config').get();
    client = redis.createClient(6379, '127.0.0.1', {})
//client = redis.createClient(config.redis_port, config.redis_host, {})
// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { */
/* ... *//*
 });
client.info(function(err,response){
    console.log(err,response);
});
client.on("error", function (err) {
    console.log("Redis Error " + err);
});

client.send_command("GEOADD",["潍坊:21路:0:location", "13.361389","38.115556","COR"], redis.print);

// Export RedisClient constructor
module.exports.RedisClient = client;*/
