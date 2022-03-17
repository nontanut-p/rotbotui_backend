const rclnodejs = require('rclnodejs');
var fs = require('fs');
var parse_path = require('./parse_path');
var node, srv_get_path_list, path_data;

module.exports = {
  init: function(){
    return rclnodejs.init().then(() => {
      node = rclnodejs.createNode('robot_gateway', '/agribot');
      srv_get_path_list = node.createClient(
        'agribot_interfaces/srv/GetPathList',
        '/agribot/path/get_path_list'
      );
      
      rclnodejs.spin(node);
      return Promise.resolve();
    });
  },

  get_path_list: get_path_list,
  get_path: get_path,
};


function get_path_list(client){
  console.log('get_path_list');
  return new Promise((resolve,reject)=>{
    srv_get_path_list.waitForService(100).then((result) => {
      try{
        if (!result) {
          return reject('Service not found');
        }
        srv_get_path_list.sendRequest( {}, (response) => {
          if( response.result!=0 ){
            return reject('Cannot get path list : result = '+response.result);
          }
          else{
            path_data = response;
            return resolve(response);
          }
        });
      }
      catch(e){
        reject(e);
      }
    });
  });
}


function get_path(path_name){
  console.log('get_path : '+path_name);

  if( !path_data ){
    return get_path_list()
    .then(()=>{
      return get_path(path_name);
    });
  }
  
  var path_file;
  for(var i=0;i<path_data.name.length;i++){
    if( path_data.name[i]==path_name ){
      path_file = path_data.file_path[i];
      break;
    }
  }
  if( !path_file ){
    console.error('ros2node.get_path : path "' +path_name+ '" not found');
    return Promise.resolve(null);
  }
  
  return new Promise((resolve,reject)=>{
    fs.readFile( path_file, (err, data) => {
      if( err ){
        return reject(err);
      }
      resolve(parse_path.execute( data ));
    });
  });
}

// for debug
if (require.main === module) {
  get_path('/home/tong/temp/agribot_path/201214-081750_opt.path')
  .then((wp)=>{
    console.log(wp);
  });
}
