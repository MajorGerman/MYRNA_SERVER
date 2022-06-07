const { gql } = require("apollo-server-express");

const LocationTypes = gql`
    type Location {
        id: Int!,
        latitude: Float,
        longitude: Float,
        country: String!,
        city: String!,
        postal_code: String!,
        details: String
    }
    type Place {
        id: Int!,
        name: String!,
        paradigm: String!,
        location_id: Location!, 
    }
    type Mutation {
        createLocation(longitude: Float, latitude: Float, country: String! ,city: String!, postal_code: String!, details: String): Location!
    }
    
`

module.exports = {LocationTypes}