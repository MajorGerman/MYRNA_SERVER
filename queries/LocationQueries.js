const {getOne, getMany, insert} = require('../tools/QueryTool')
const {pool} = require("../connector");

const createLocation = async (longitude, latitude, country ,city, postal_code, details)=>{
    console.log(`INSERT INTO locations (country, city, postal_code ${longitude ? ',longitude ': ''} ${latitude ? ',latitude ': ''} ${details ? ',details ': ''})
    VALUES ('${country}' , '${city}', '${postal_code}' ${longitude ? `, '${longitude}' ` : '' } ${latitude ? `, '${latitude}' ` : '' } ${details ? `, '${details}' ` : '' })`)
    await insert(pool, `INSERT INTO locations (country, city, postal_code ${longitude ? ',longitude ': ''} ${latitude ? ',latitude ': ''} ${details ? ',details ': ''})
                VALUES ('${country}' , '${city}', '${postal_code}' ${longitude ? `, '${longitude}' ` : '' } ${latitude ? `, '${latitude}' ` : '' } ${details ? `, '${details}' ` : '' })`)
}
const getLastLocation = () =>{
    return getOne(pool, `SELECT * FROM locations WHERE id = (SELECT MAX(id) FROM locations)`)
}
module.exports = {
    createLocation,
    getLastLocation
}