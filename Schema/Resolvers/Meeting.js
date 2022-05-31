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
        },
        inviteUserToMeeting: (_, {meeting_id, user_id}) => {
            try{
                MeetingQueries.addMeetingUser(meeting_id, user_id)
            } catch (err) {
                return false
            }
            return true
        }
    },
    Meeting:{
        type: async (meeting) =>{
            return (await MeetingQueries.getMeetingType(meeting.id)).name
        },
        members: async (meeting) => {
            return MeetingQueries.getAllMeetingMembers(meeting.id)
        }
    }
}
module.exports = {MeetingResolvers}