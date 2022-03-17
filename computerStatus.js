const si = require('systeminformation');

const status =(pc) => {   
    si.cpuTemperature().then(data =>{pc.temp = data.max;})
    .catch(error => console.error(error));
    si.mem().then(data => pc.ramUsage = parseInt(data.active/1000000))
    .catch(error => console.error(error));
    si.battery()
    .then(data => pc.battery = data.percent)
    .catch(error => console.error(error));
    si.currentLoad()
    .then(data => pc.cpuUsage = data.currentLoad.toFixed(2))
    .catch(error => console.error(error));
  }

module.exports = { 
    status
}
