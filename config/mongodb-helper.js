/**
 * Created by rainbow on 15-7-4.
 */
var mongoose = require('mongoose')
    , config = require('./config').get();

module.exports = function () {
// Database
    var connectStr = config.db_prefix + '://' + config.host + ':' + config.db_port + '/' + config.db_database;
    console.log(connectStr);
    mongoose.connect(connectStr, {server: {auto_reconnect: true}});
    var db = mongoose.connection;

// the reconnect seems to behave properly, but the link to this particular instance gets lost?
// the recinnected and open don't work after a disconnect, although everything else seems to be working
    mongoose.connection.on('opening', function () {
        console.log("MongoDB reconnecting... %d", mongoose.connection.readyState);
    });
    db.once('open', function callback() {
        console.log("MongoDB Database connection opened.");
    });
    db.on('error', function (err) {
        console.log("MongoDB Connection error %s", err);
    });
    db.on('reconnected', function () {
        console.log('MongoDB reconnected!');
    });
    db.on('disconnected', function () {
        console.log('MongoDB disconnected!');
        mongoose.connect(connectStr, {server: {auto_reconnect: true}});
    });
}