const rclnodejs = require('rclnodejs');

var gnssMessage

rclnodejs
  .init()
  .then(() => {
    const node = rclnodejs.createNode('GNSS_NODE');
    let nodeGNSS = node.createSubscription(
    'agribot_interfaces/msg/Odom', // msg type
    '/agribot/odom/odom_gnss' ,// topic name /agribot/odom/odom_gnss
    //'/image',
    async (msg) => { 
        console.log(msg)
        gnssMessage = msg
        console.log('test for loop')
        return 0 
    });

    rclnodejs.spin(node);
    
  })
  .catch((e) => {
    console.log(e,'cant find some topic ');
});

exports.gnssMessage = gnssMessage;