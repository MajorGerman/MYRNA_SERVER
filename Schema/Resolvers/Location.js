const LocationQueries = require('../../queries/LocationQueries');
const LocationResolvers = {
    Query: {
        getAllPlaces: async () =>{
            return LocationQueries.getAllPlaces()
        }
    },
    Mutation:{
        createLocation: async (_, {longitude, latitude, country ,city, postal_code, details}) =>{
            await LocationQueries.createLocation(longitude, latitude, country, city, postal_code, details);
            return await LocationQueries.getLastLocation()
        }
    },
    Place: {
        location: (place) => {
            return LocationQueries.getLocationByPlaceId(place.id)
        }
    }

}
module.exports = {LocationResolvers}