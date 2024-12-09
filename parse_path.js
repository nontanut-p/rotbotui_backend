'use strict';
const fs = require('fs')
const PATH_PROFILE_PREFIX = [1, 0]
  , PATH_PROFILE_SUFFIX = [18, 251]
  , MAX_PATH_NAME = 64
  , PROFILE_SIZE = PATH_PROFILE_PREFIX.length
    + MAX_PATH_NAME+1
    + 8*2
    + PATH_PROFILE_SUFFIX.length
  , DATA_SIZE = 8*7;


module.exports = {
  execute: execute,
};


function execute(raw_data){
  var data = new Uint8Array(raw_data);
  var len = data.length
    , data_len = len - PROFILE_SIZE;

  var s = '';
  for(var i=data_len;i<len;i++){
    s+= ' '+data[i];
  }
  for(var i=0;i<PATH_PROFILE_PREFIX.length;i++){
    if( data[data_len + i]!=PATH_PROFILE_PREFIX[i] ){
      throw 'Invalid path profile prefix';
    }
  }
  for(var i=0;i<PATH_PROFILE_SUFFIX.length;i++){
    if( data[len - PATH_PROFILE_SUFFIX.length + i]!=PATH_PROFILE_SUFFIX[i] ){
      throw 'Invalid path profile suffix';
    }
  }
  if( data_len % DATA_SIZE!=0 ){
    throw 'Invalid data length';
  }
  var float_data = new Float64Array(data.slice(0, data_len).buffer)
    , waypoints = [];
  for(var i=0;i<float_data.length;i+=7){
    waypoints.push( float_data[i+1], float_data[i+2], 0.0 );  // y
  }
  return waypoints;
}


var waypoints ;
fs.readFile('./path2.path' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  
  waypoints = execute(data)
  console.log(waypoints.length)
  console.log(waypoints)


})
