    const { gql } = require("apollo-server-express");

const MeetingTypes = gql`
    type Meeting {
        id: Int!,
        name: String!,
        date: String,
        type: String!,
        status: String,
        creator: User!,
        chief: User!,
        places: [Place],
        members: [User],
        messages: [MeetingMessage]
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
        createNewMeeting(name: String!,date: String, type: Int, creator: Int!, status: String): Meeting!
        inviteUserToMeeting(meeting_id: Int!, user_id: Int!): User
        createMeetingMessage(meeting_id: Int!, author: Int!,content: String!, referenceMessageId: Int): MeetingMessage!
        deleteMeeting(meeting_id: Int!, user_id: Int!) : Boolean!
        changeMeeting(meeting_id: Int!, name: String, date: String ): Meeting!
        makeChief(meeting_id: Int!, user_id: Int!): Boolean!
        makeImportant(meeting_id: Int!, user_id: Int!): Boolean!

    }
`

module.exports = { 
    MeetingTypes
}