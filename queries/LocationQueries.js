const {getOne, getMany, insert} = require('../tools/QueryTool')
const {pool} = require("../connector");

const createLocation = async (longitude, latitude, country ,city, postal_code, details)=>{
    await insert(pool, `INSERT INTO locations (country, city, postal_code ${longitude ? ',longitude ': ''} ${latitude ? ',latitude ': ''} ${details ? ',details ': ''})
                VALUES ('${country}' , '${city}', '${postal_code}' ${longitude ? `, '${longitude}' ` : '' } ${latitude ? `, '${latitude}' ` : '' } ${details ? `, '${details}' ` : '' })`)
}
const getLastLocation = () =>{
    return getOne(pool, `SELECT * FROM locations WHERE id = (SELECT MAX(id) FROM locations)`)
}
const getAllPlaces = () =>{
    return getMany(pool,`SELECT * FROM places`)
}
const getLocationByPlaceId = (id) =>{
    return getOne(pool, `SELECT * FROM locations WHERE locations.id = (SELECT location_id FROM places WHERE places.id = ${id})`)
}
module.exports = {
    createLocation,
    getLastLocation,
    getAllPlaces,
    getLocationByPlaceId
}