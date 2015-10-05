
/**
 * Main application server setup
 */
var cmdlineEnv = process.argv[2];
// if command line option given, override NODE_ENV
console.log('Env :' + cmdlineEnv);

if (cmdlineEnv && cmdlineEnv.length > 0) {
  if (cmdlineEnv == '-d' || cmdlineEnv.toUpperCase() == '--DEVELOPMENT') {
    process.env.NODE_ENV = 'development';
  } else if (cmdlineEnv == '-q' || cmdlineEnv.toUpperCase() == '--QA') {
    process.env.NODE_ENV = 'qa';
  } else if (cmdlineEnv == '-p' || cmdlineEnv.toUpperCase() == '--PRODUCTION') {
    process.env.NODE_ENV = 'production';
  }  else if (cmdlineEnv == '-u' || cmdlineEnv.toUpperCase() == '--UNIT_TEST') {
    process.env.NODE_ENV = 'unit_test';
  } else {
    console.log("Usage: node app.js");
    console.log("Default usage uses the Devlopment configuration unless NODE_ENV is defined as [development|test|production]");
    console.log("The environment variable can be overridden on the command line using one of the following arguments:");
    console.log("\tnode app.js [-d|-q|-p|-u|--development|--qa|--production|--unit_test]");
    console.log("Alternatively there are scripts defined in package.json, to use one of these:");
    console.log("\tnpm run-scripts <dev|qa|prod|database>");
    console.log("Where database is used to set up the database the first time, and is envirnment specific, probably want to use the scripts.");
    return false;
  }
}

// Load configurations
var env = process.env.NODE_ENV || 'development'
    , config = require('./config/config').init(env);

// Modules
var restify = require("restify")
    , redis = require("redis")
    , neo4j = require('neo4j')
    , mongoose = require('mongoose')
    , fs = require('fs')
    , preflightEnabler = require('se7ensky-restify-preflight');

// Paths
var models_path = config.root + '/models';
var utils_path = config.root + '/jsUtil';
var config_path = config.root + '/config';
var routes_path = config.root + '/routes';

//Configure the Redis
var redisClient = redis.createClient(config.redis_port, config.redis_host, {});
redisClient.info(function(err,response){
  console.log(err,response);
});
redisClient.on("error", function (err) {
  console.log("Redis Error " + err);
});

//Configure the Neo4j
var neo4jDB = new neo4j.GraphDatabase('http://'+config.neo4j_user+':'+config.neo4j_password+'@localhost:'+config.neo4j_port);

//Configure the MongoDB
require(config_path + '/mongodb-helper')();

// Bootstrap models
fs.readdirSync(models_path).forEach(function (file) {
  console.log("Loading model " + file);
  require(models_path+'/'+file);
});

// Bootstrap auth middleware
var auth = require(config_path + '/middlewares/authorization.js');
auth.setConfig(config);

// Bootstrap JavaScript utilities
// globals considered bad, eventually this container should be rewritten into a module
globalUtil = {};
fs.readdirSync(utils_path).forEach(function (file) {
  console.log("Loading utility " + file);
  var variableName = file.substring(0, file.indexOf('.'));
  require(utils_path+'/'+file)(globalUtil, config, auth);
});
//console.log(globalUtil.generatePassword());

// Configure the server
var app = restify.createServer({
  //certificate: ...,
  //key: ...,
  name: 'crud-test',
  version: config.version
});

app.on('error', function(err) {
  if(err.errno === 'EADDRINUSE') {
    console.log('Port already in use.');
    process.exit(1);
  } else {
    console.log(err);
  }

});

// allows authenticated cross domain requests
preflightEnabler(app);

// function to retrieve the session secret from the database
// checks for existing or creates one if none available
// avoids having to hardcode one in configuration and allows multiple
// servers to share the key
SessionKey = mongoose.model('SessionKey');
var sessionKey;
SessionKey.findOne({ key: /./ }, function (err, sessionKeyResult) {
  if (!err) {
    if (!sessionKeyResult) {
      // No key found, so create and store
      console.log('Setting up a new session key.');
      sessionKey = new SessionKey();
      sessionKey.key = (new mongoose.Types.ObjectId()).toString();
      sessionKey.save(function (err) {
        if(err)console.log(JSON.stringify(err));
      });
    } else {
      // use key founf in the database
      console.log('Retrieved session key from db.');
      sessionKey = sessionKeyResult;
    }

    // because we can't have a synchronous DB call, finish up the server setup here
    // restify settings
    require(config_path + '/restify-server')(app, sessionKey.key);

    // configure email
    var MailHelper = require(config_path + '/mail-helper.js').MailHelper;

    require(routes_path + '/routes')(app, new MailHelper(config),redisClient,neo4jDB);

    // configure Socket Server
    var SocketHelper_IO = require(config_path + '/socket-helper-socket-io.js').SocketHelper;
    new SocketHelper_IO(app, config);

    // Start the app by listening on <port>
    var port = process.env.PORT || config.port;

    app.listen(port);
    console.log('App started on port ' + port);

  } else {
    console.log("Failed to start server due to database issue.");
    console.log(err);
  }
});






