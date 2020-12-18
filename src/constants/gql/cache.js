import { gql } from '@apollo/client';

export const GET_PLANS = gql`
  query GetPlans {
    getPlans{
      plans @client
    }
  }
`;

export const GET_FAVORITES = gql`
  query GetFavorites {
    getFavorites @client
  }
`;

export const GET_KORREPETITION_GROUPED_INSTRUMENT = gql`
query GetKorrepetitionGroupedInstrument {
  getKorrepetitionGroupedInstrument @client
}
`;

export const GET_SORTED_CONTACT_LIST = gql`
  query GetSortedContactList {
    getSortedContactList{
      sortedContactList @client
    }
  }
`;

export const GET_PLAYED_INSTRUMENTS = gql`
  query GetPlayedInstruments {
      getCachedPlayedInstruments @client
    }
`;

export const GET_SORTED_UNCONFIRMED_STUDENT_LIST = gql`
  query SortedUnconfirmedStudentList {
      getSortedUnconfirmedStudentList @client {
        type
        name
        id
      }
    }
`;

export const GET_FORMATTED_TIMETABLE = gql`
query FormattedTimetable {
    getFormattedTimetable @client {
      lanes {
        id,
        title,
        linkedId,
        cards {
          id
          title,
          description,
          type,
          linkedId,
          group,
          timeslotId
        }
      }
    }
  }
`;
export default {
  GET_SORTED_CONTACT_LIST,
  GET_PLAYED_INSTRUMENTS,
  GET_FORMATTED_TIMETABLE,
};
