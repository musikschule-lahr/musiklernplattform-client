import { gql } from '@apollo/client';
import { UserBoardFragments, GroupBoardFragments } from './fragments';

export const GET_BOARD = gql`
    query getMyUserBoard{
      getMyUserBoard
      {
        ...UserBoardParts
      }
    }
    ${UserBoardFragments.general}
`;

export const GET_BOARD_BY_ID = gql`
    query getUserBoard($userid: Int!){
      getUserBoardFromUser
      (
        where: {
          id: $userid
        }
      )
      {
        ...UserBoardParts
      }
    }
    ${UserBoardFragments.general}
`;

export const GET_GROUP_BOARD = gql`
query getGroupsOfOwner{
  getGroupsOfOwner{
    board{
      ...GroupBoardParts
    }
  }
}
${GroupBoardFragments.general}
`;

export const GET_GROUP_BOARD_BY_ID = gql`
query getGroupBoard($groupid: Int!){
  getGroupBoard
  (
    where: {
      id: $groupid
    }
  )
  {
    ...GroupBoardParts
  }
}
${GroupBoardFragments.general}
`;

export const MOVE_CARD = gql`
mutation MoveCard($cardid: Int!, $lanefromid: Int!, $lanetoid: Int!, $cardlanesorting:Int!) {
  moveCard(
    where: {
      card:{
        id: $cardid
        },
      lane: {
        id: $lanefromid
      }
    },
    to:{
      lane:{
        id: $lanetoid
      },
      sorting: $cardlanesorting
    }
  )
  {
    idCard,
    id @client,
  }
}
`;

export const ADD_USER_CARD = gql`
  mutation AddUserCard($laneid: Int!,
  $cardlanesorting:Int!,
   $description:String!,
   $libElement:LibElementInput){
    addUserCard(
      to:{
        lane:{
          id:$laneid
        },
        sorting:$cardlanesorting
      },
      data:{
        description: $description
        libElement: $libElement
      },
    )
    {
      ...CardParts
    }
  }
  ${UserBoardFragments.cards}
`;

export const ADD_GROUP_CARD = gql`
  mutation AddGroupCard($laneid: Int!, $cardlanesorting:Int!, $description:String!, $groupid: Int!,
   $libElement:LibElementInput){
    addGroupCard(
      to:{
        lane:{
          id:$laneid
        },
        sorting:$cardlanesorting
      },
      data:{
        description: $description,
        libElement: $libElement
      },
      group:{
        id: $groupid
      }
    )
    {
      ...CardParts
    }
  }
  ${UserBoardFragments.cards}
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($cardId: Int!, $description:String){
    updateCardContent(
      where : {
        id: $cardId
      },
      data: {
        description: $description
      }
    )
    {
      ...CardParts
    }
  }
  ${UserBoardFragments.cards}
`;

export const REMOVE_CARD = gql`
  mutation RemoveCard($cardId: Int!){
    removeCard(
      where: {
        id: $cardId
      }
    )
  }
`;

// Subscriptions

export const USERBOARD_GET_EXTERNALCARD_SUBSCRIPTION = gql`
    subscription UserBoardGotExternalCard($userId: Int!){
      userBoardGotExternalCard(
      where: {
        id: $userId
      }
    )
      {
        messages{
          changedId
          type
        }
        user
      }
    }
`;

export const USERBOARD_GET_BOARD_SUBSCRIPTION = gql`
subscription UserBoardChanged($userId: Int!){
  userBoardChanged(
  where: {
    id: $userId
  }
)
  {
    messages{
      changedId
      type
    }
    user
  }
}
`;

export default {
  GET_BOARD,
  GET_GROUP_BOARD,
  MOVE_CARD,
  ADD_USER_CARD,
  ADD_GROUP_CARD,
  UPDATE_CARD,
  REMOVE_CARD,
};
