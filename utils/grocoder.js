const nodeGrocoder = require('node-geocoder') 

const options = {
    provider: 'openstreetmap',
    httpAdapter: 'https',
    formatter: null
};


const geoCoder = nodeGrocoder(options)
module.exports = geoCoder