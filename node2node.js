const rclnodejs = require('rclnodejs');
//const {performance} = require('perf_hooks'); for test the performance
var fs = require('fs');  // for read or write data
var atob = require('atob')
const sharp = require('sharp');
//const client = require('./client');
const { count } = require('console');
var camera_selector = 1
console.log(camera_selector)
var base64Img
var positionLL = []
var counter = 0 
// Camera topic name 

let listOfCam = ['','/agribot/camera/rear/image_raw' , '/agribot/camera/weed1/image_raw','/agribot/camera/rs_front/color/image_raw']

/// Initial value ///

lat_0 = 14.08214719610437
lon_0 =  100.60713766385788
earth_radius = 6356752.3142    
var cameraTopic ='/agribot/camera/rs_front/color/image_raw'
exportData = [base64Img, positionLL]
const changeCam = (cam)=>{
  // console.log('Camera is changing ....  from ', camera_selector , ' to ' , cam)
  camera_selector = cam
}

const meter2lla =(x , y) =>{
  
  lat = y*180.0/(earth_radius*Math.PI) + lat_0
  b = Math.tan( x/(earth_radius*2) )**2
  
  a = b/(b+1)
  
  c = Math.asin( Math.sqrt( a / Math.cos(lat_0* Math.PI/180.0)**2 ) ) * 180.0 / (0.5* Math.PI)
  if (x>0){
    c = Math.abs(c)
  }else {
    c = -Math.abs(c)
  }
  lon = c + lon_0
  position = [lat,lon]
  return position
}

function image_processing(msg){
  var raw = atob(msg.data)
  var array = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i)
  }
  var frameData = Buffer.alloc(msg.width * msg.height * 3)
  for (let i = 0; i < msg.width * msg.height; i++) {
    frameData[3 * i + 2] = array[3 * i + 0] // b
    frameData[3 * i + 1] = array[3 * i + 1] // g
    frameData[3 * i + 0] = array[3 * i + 2] // r
    
  }

  sharp(frameData, {
    // because the input does not contain its dimensions or how many channels it has
    // we need to specify it in the constructor options  BGR to RGB
    raw: {
      width: msg.width,
      height: msg.height,
      channels: 3
    }})
    .toFormat('jpeg')
    .toBuffer().then((data)=>{
     
     base64Img = data.toString('base64')
     //console.log(base64Img)
     exportData[0] = base64Img
 //    var t1 = performance.now();
     //total = ((t1-t0) + total)
     //avrage = total/start
   //  start = start+ 1
//      console.log("Call to find took " + (t1 - t0) + " milliseconds. total = "+ avrage + 'ms' );
    })

}
rclnodejs
  .init()
  .then(() => {
    console.log('test for loop')
    const node = rclnodejs.createNode('nodeJS');
   let gnssData = node.createSubscription(
      'agribot_interfaces/msg/Odom', // msg type
      '/agribot/odom/odom_gnss' ,// topic name 
    (state) => {
      console.log(state)
      topicData = state
      //console.log(state)
      //console.log(state.lat, state.lon)
      lat = topicData.lat
      lon = topicData.lon
      positionLL = [lat, lon]
      exportData[1] = positionLL
      //console.log(positionLL)
      
    })
    let camNode = node.createSubscription(
      'sensor_msgs/msg/Image', // msg type
      '/agribot/camera/rear/image_raw',// topic name agribot/camera/rear/image_raw 
      //'/image',
      async (msg) => { 
        if(camera_selector == 1){
          //console.log('test',msg)
          image_processing(msg)
        }else 
        return 0 
      });

    let camNode2 = node.createSubscription(
      'sensor_msgs/msg/Image', // msg type
      '/agribot/camera/rs_front/color/image_raw', // topic name agribot/camera/rear/image_raw 
      
      async (msg) => { 
        if(camera_selector == 2){
          // console.log('test 2', camera_selector)
          image_processing(msg)
        }else 
        
        return 0 

      }
  );
  let camNode3 = node.createSubscription(
    'sensor_msgs/msg/Image', // msg type
    '/agribot/camera/weed1/image_raw', // topic name agribot/camera/rear/image_raw 
    
    async (msg) => { 
      if(camera_selector === 3){
        // console.log('test 3')
        image_processing(msg)
      }else 
      
      return 0 

    }
    
);
let camNode4 = node.createSubscription(
  'sensor_msgs/msg/Image', // msg type
  '/image', // topic name agribot/camera/rear/image_raw 
  
  async (msg) => { 
    console.log('msg4', msg)
    if(camera_selector == 0){
      console.log('test 4')
      image_processing(msg)
    }else 
    
    return 0 

  }
  
);
    rclnodejs.spin(node);
    
  })
  .catch((e) => {
    console.log(e,'cant find some topic ');
});


exports.exportData = exportData;
exports.changeCam = changeCam;