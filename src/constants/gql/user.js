import { gql } from '@apollo/client';
import { UserFragments, RelationFragments } from './fragments';

export const GET_USER_BY_ID = gql`
  query User ($userId: Int!) {
    getUserFromId (
      where: {
        id: $userId
      }
    )
    {
      ...UserParts
      relatedTo {
        ...RelationKeyArgs
      }
      relatedBy {
        ...RelationKeyArgs
      }
    }
  }
  ${UserFragments.general}
  ${RelationFragments.keyArgs}
`;

export const GET_USER = gql`
  query User {
    getUser {
      ...UserParts
      relatedTo {
        ...RelationKeyArgs
      }
      relatedBy {
        ...RelationKeyArgs
      }
    }
  }
  ${UserFragments.general}
  ${RelationFragments.keyArgs}
`;

export const GET_SCHOOL_BY_USER_ID = gql`
query getSchoolByUserId ($userId: Int!) {
  getSchoolByUserId (
      where: {
        id: $userId
      }
    )
 {
  name
  address
  zip
  city
  }
}
`;

export const REGISTER_USER = gql`
  mutation AddUser (
    $firstname: String!,
    $lastname: String!,
    $username: String!,
    $mail: String!,
    $phone: String,
    $birthyear: Int!,
    $instruments: [InstrumentInput!]
    ) {
      addRegisteredUser (
      data: {
        firstname: $firstname,
        lastname: $lastname,
        username: $username,
        mail: $mail,
        phone: $phone,
        birthyear: $birthyear,
        instruments: $instruments,
      }
    )
    {
      ...UserParts
      relatedTo {
        ...RelationKeyArgs
      }
      relatedBy {
        ...RelationKeyArgs
      }
    }
  }
  ${UserFragments.general}
  ${RelationFragments.keyArgs}
`;
export const UPDATE_USER = gql`
  mutation UpdateUser (
    $firstname: String,
    $lastname: String,
    $username: String,
    $mail: String,
    $phone: String,
    $birthyear: Int,
    $instruments: [InstrumentInput],
    ) {
      updateRegisteredUser (
      data: {
        firstname: $firstname,
        lastname: $lastname,
        username: $username,
        mail: $mail,
        phone: $phone,
        birthyear: $birthyear,
        instruments: $instruments,
      }
    )
    {
      ...UserParts
      relatedTo {
        ...RelationKeyArgs
      }
      relatedBy {
        ...RelationKeyArgs
      }
    }
  }
  ${UserFragments.general}
  ${RelationFragments.keyArgs}
`;

export const GET_INSTRUMENTS = gql`
  query Instruments {
    getInstruments {
      idInstrument,
      id @client
      selected @client
      name,
      instrumentGroup
    }
  }
`;

export const GET_INSTRUMENT_FROM_ID = gql`
  query Instrument ($instrumentId: Int!) {
    getInstrumentFromId (
      where: {
        id: $instrumentId
      }
    )
     {
      idInstrument,
      id @client
      name,
      instrumentGroup
    }
  }
`;
export default {
  GET_USER, GET_USER_BY_ID, REGISTER_USER, UPDATE_USER, GET_INSTRUMENTS, GET_INSTRUMENT_FROM_ID,
};
