const LocationQueries = require('../../queries/LocationQueries');
const LocationResolvers = {
    Mutation:{
        createLocation: async (_, {longitude, latitude, country ,city, postal_code, details}) =>{
            await LocationQueries.createLocation(longitude, latitude, country, city, postal_code, details);
            return await LocationQueries.getLastLocation()
        }
    }

}
module.exports = {LocationResolvers}