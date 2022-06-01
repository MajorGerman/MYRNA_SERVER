const PostQueries = require('../../queries/MeetingQueries')
const MeetingQueries = require('../../queries/MeetingQueries')
const MeetingResolvers = {
    Query: {
        getAllMeetings: () =>{
            return PostQueries.getAllMeetings();
        },
    },
    Mutation: {
        createNewMeeting: async (_, {name,date, type, creator,status}) => {
            await MeetingQueries.createNewMeeting(name,date, type,status)

            const meeting = await MeetingQueries.getLastMeeting();

            MeetingQueries.addMeetingUser(meeting.id, creator);

            meeting.date = new Date(meeting.date).toDateString()
            return meeting
        },
        inviteUserToMeeting: (_, {meeting_id, user_id}) => {
            try{
                MeetingQueries.addMeetingUser(meeting_id, user_id)
            } catch (err) {
                return false
            }
            return true
        },
        createMeetingMessage: (_, {meeting_id, author,content, referenceMessageId}) =>{
            try{
                MeetingQueries.addMeetingMessage(meeting_id, author, content, referenceMessageId);
            } catch (err){

            }
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