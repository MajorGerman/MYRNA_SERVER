const { gql } = require("apollo-server-express");

const MeetingTypes = gql`
    type Meeting {
        id: Int!,
        name: String!,
        date: String,
        type: String!,
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
    type Mutation {
        createNewMeeting(name: String!,date: String, type: Int, creator: Int!): Meeting!
        inviteUserToMeeting(meeting_id: Int!, user_id: Int!): Boolean!
    }
`

module.exports = { 
    MeetingTypes
}