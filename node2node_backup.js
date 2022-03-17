const rclnodejs = require('rclnodejs');
const {performance} = require('perf_hooks');
var fs = require('fs');
var atob = require('atob')
var jpeg =require ('jpeg-js')
const sharp = require('sharp');
var unicode
var base64Img
var positionLL = []
lat_0 = 14.08214719610437
lon_0 =  100.60713766385788
earth_radius = 6356752.3142    
exportData = [base64Img, positionLL]

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
var start = 1
var total = 0
rclnodejs.init().then(() => {
          
  
          node.createSubscription(
              'sensor_msgs/msg/Image', // msg type
              //'/agribot/camera/rear/image_raw' ,// topic name agribot/camera/rear/image_raw 
              '/image',
            (state) => {
             // console.log(state);
              var t0 = performance.now();
              unicode = state

              console.log(unicode)
              sharp(unicode.data, {
                // because the input does not contain its dimensions or how many channels it has
                // we need to specify it in the constructor options  BGR to RGB
                raw: {
                  width: 320,
                  height: 240,
                  channels: 3
                }})
                .toColourspace('srgb')
                .toFormat('jpeg')
                .toBuffer().then((data)=>{
                 
                 base64Img = data.toString('base64')
                 //console.log(base64Img)
                 exportData[0] = base64Img
                 var t1 = performance.now();
                 total = ((t1-t0) + total)
                 avrage = total/start
                 start = start+ 1
                 console.log("Call to find took " + (t1 - t0) + " milliseconds. total = "+ avrage + 'ms' );
                })
               
              //state.data
             // console.log('*************************---------------------------------------------------------------------------*************************')
              //console.log('Hey') 
              //console.log('*************************---------------------------------------------------------------------------*************************')
            }
          );
          node.createSubscription(
            'tutorial_interfaces/msg/Num', // msg type
            '/topic' ,// topic name 
            
          (state) => {
            
            topicData = state
            //console.log(state)
            //console.log(state.lat, state.lon)
            lat = topicData.lat
            lon = topicData.lon
            positionLL = [lat, lon]
            exportData[1] = positionLL
            //console.log(positionLL)
            
       
            
          }
        );
          rclnodejs.spin(node);
        })
        .catch((e) => {
          console.log(e);
      });



exports.exportData = exportData;
