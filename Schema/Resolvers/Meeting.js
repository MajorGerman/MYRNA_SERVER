const PostQueries = require('../../queries/MeetingQueries')
const MeetingQueries = require('../../queries/MeetingQueries')
const MeetingResolvers = {
    Query: {
        getAllMeetings: () =>{
            return PostQueries.getAllMeetings();
        }
    },
    Mutation: {
        createNewMeeting: async (_, {name,date, type, creator}) => {
            MeetingQueries.createNewMeeting(name)

            const meeting = await MeetingQueries.getLastMeeting();

            MeetingQueries.addMeetingUser(meeting.id, creator);

            return meeting
        }
    },
    Meeting:{
        type: async (meeting) =>{
            return (await MeetingQueries.getMeetingType(meeting.id)).name
        }
    }
}
module.exports = {MeetingResolvers}