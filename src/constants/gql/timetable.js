import { gql } from '@apollo/client';
import { TimetableFragments } from './fragments';

export const GET_TIMETABLE = gql`
  query GetTimetable {
      getTimetable {
        idTimetable,
        id @client
        days {
          id @client
          idDay
          day
          timeslots {
          ...TimeslotParts
          }
        }
      }
  }
  ${TimetableFragments.timeslot}
`;
export const ADD_TIMESLOT_GROUP = gql`
  mutation AddTimeslotGroup($dayid: Int!, $time:Time!, $groupid:Int!){
    addTimeslotGroup(
      where: {
        day: {
          id: $dayid
        },
        time: $time
      },
      group: {id: $groupid}
    )
    {
      ...TimeslotParts
    }
  }
  ${TimetableFragments.timeslot}
`;
export const ADD_TIMESLOT_USER = gql`
  mutation AddTimeslotUser($dayid: Int!, $time:Time!, $userid:Int!){
    addTimeslotUser(
      where: {
        day: {
          id: $dayid
        },
        time: $time
      },
      user: {id: $userid}
    )
    {
      ...TimeslotParts
    }
  }
  ${TimetableFragments.timeslot}
`;

export const UPDATE_TIMESLOT_TIME = gql`
  mutation UpdateTimeslotTime(
    $timeslotId: Int!,
    $dayid: Int!
    $time:Time!
    ){
    updateTimeslotTime(
      where: {
          id: $timeslotId
      },
      to: {
        day: {id: $dayid}
        time: $time
      }
    )
    {
      ...TimeslotParts
    }
  }
  ${TimetableFragments.timeslot}
`;

// mutation{removeTimeslot(where: {id: 9}){idTimeslot, time}}
export const REMOVE_TIMESLOT = gql`
  mutation RemoveTimeslot($timeslotId: Int!){
    removeTimeslot(
      where: {
          id: $timeslotId
        },
    )
    {
      ...TimeslotParts
    }
  }
  ${TimetableFragments.timeslot}
`;

export default {
  GET_TIMETABLE, ADD_TIMESLOT_GROUP, REMOVE_TIMESLOT,
};
