const { gql } = require("apollo-server-express");

const MeetingTypes = gql`
    type Meeting {
        id: Int!,
        name: String!,
        date: String,
        type: Int!,
        members: [User] 
    }
    type MeetingMessage {
        id: Int!,
        author: User!,
        referenceMessage: MeetingMessage,
        content: String!
    }
    type Query {
        getAllMeetings: [Meeting]
    }
`

module.exports = { 
    MeetingTypes
}