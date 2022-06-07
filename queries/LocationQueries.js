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
const getLocationByUserId = (id) =>{
    return getOne(pool, `SELECT * FROM locations WHERE locations.id = (SELECT location FROM users WHERE users.id = ${id})`)
}
const getPlacesByMeetingId = (meeting_id) =>{
    return getMany(pool, `SELECT place_id FROM place_meetings WHERE meeting_id = ${meeting_id}`)
}
const deleteLocation = (location_id) =>{
    insert(pool, `DELETE FROM locations WHERE id = ${location_id}`)
}
module.exports = {
    createLocation,
    getLastLocation,
    getAllPlaces,
    getLocationByPlaceId,
    getLocationByUserId,
    getPlacesByMeetingId,
    deleteLocation
}