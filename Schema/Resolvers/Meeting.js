const PostQueries = require('../../queries/MeetingQueries')
const MeetingResolvers = {
    Query: {
        getAllMeetings: () =>{
            return PostQueries.getAllMeetings();
        }
    },
    Mutation: {

    },
    Meeting:{

    }
}
module.exports = {MeetingResolvers}