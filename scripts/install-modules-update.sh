# Assumes server is in parent directory, set to absolute path to run script from anywhere
export SERVER_HOME=.. 
cd $SERVER_HOME 
npm update -g serialport 
npm update -g node-gyp 
npm update 