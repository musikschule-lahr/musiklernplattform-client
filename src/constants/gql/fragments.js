import { gql } from '@apollo/client';

export const UserFragments = {
  general: gql`
    fragment UserParts on User {
      idUser,
      id @client,
      firstname,
      lastname,
      username,
      mail,
      phone,
      birthyear,
      matrixUserName
      instruments {
        idInstrument,
        id @client,
        name
        instrumentGroup
      }
      teachedInstruments {
        idInstrument
        instrumentGroup
        id @client
        name
      }
    }
  `,
};
export const RelationFragments = {
  general: gql`
      fragment RelationParts on UserRelation {
        idRelation
        idCompound
        id @client
        isConfirmed
        matrixRoomId
        userRole
        relatedUserRole
        confirmedInstruments
        confirmedGroups
        instruments {
          idInstrument
          instrumentGroup
          id @client
          name
        },
        groups {
          idGroup
          id @client
          name
          matrixRoomId
        }
        user {
          idUser
          id @client
          firstname
          lastname
          matrixUserName
        }
        relatedUser{
          idUser
          id @client
          firstname
          lastname
          matrixUserName
        }
        name @client,
        type @client
      }`,
  withoutUsers: gql`
       fragment RelationPartsWithoutUsers on UserRelation {
         idRelation
        idCompound
         id @client
         isConfirmed
         userRole
         relatedUserRole
         confirmedInstruments
         confirmedGroups
         matrixRoomId
         instruments {
           idInstrument
           instrumentGroup
           id @client
           name
         },
         groups {
           idGroup
           id @client
           name
           matrixRoomId
         }
         name @client,
         type @client
       }`,
  keyArgs: gql`
      fragment RelationKeyArgs on UserRelation {
        idRelation
        idCompound
        id @client
        userRole
        relatedUserRole
        isConfirmed
        matrixRoomId
        user {
            idUser
            id @client
            firstname
            lastname
            matrixUserName
        }
        relatedUser{
          idUser
          id @client
          firstname
          lastname
          matrixUserName
        }
      }
    `,
  withMailAndPhone: gql`
fragment MailPhoneRelationParts on UserRelation {
  idRelation
  idCompound
  isConfirmed
  id @client
  user {
    idUser
    id @client
    firstname
    lastname
    matrixUserName
    mail
    phone
  }
  relatedUser{
    idUser
    id @client
    firstname
    lastname
    matrixUserName
    mail
    phone
  }
  name @client,
  type @client
}`,
};

export const UserBoardFragments = {
  general: gql`
  fragment UserBoardParts on UserBoard {
    idBoard,
    id @client
    lanes
    {
      idLane,
      id @client
      laneId @client
      title
      laneType
      disallowAddingCard @client
      addModalText @client
      editModalText @client
      light @client
      cards {
        idCard,
        attachementCount @client,
        id @client
        cardId @client
        laneId @client
        date @client
        description,
        createdAt,
        creator {
          idUser,
          id @client
          firstname,
          lastname,
        }
        libElements {
          idLibElement
          playerPath
          playerType
          metaData {
            idMetaData
            title
            shortTitle
            interpreter{
              idInterpreter
              name
            }
            composer {
              idComposer
              firstname
              lastname
            }
          }
        }
        lane {
          idLane
          id @client,
        }
        author @client
      }
    }
  }`,
  cards: gql`
  fragment CardParts on Card {
    idCard,
    attachementCount @client,
    id @client
    cardId @client
    laneId @client
    date @client
    description,
    createdAt,
    creator {
      idUser,
      id @client
      firstname,
      lastname,
    }
    libElements {
      idLibElement
      playerPath
      playerType
      metaData {
        idMetaData
        title
        shortTitle
        interpreter{
          idInterpreter
          name
        }
        composer {
          idComposer
          firstname
          lastname
        }
      }
    }
    lane {
      idLane
      id @client,
    }
    author @client
  }
 `,
};
export const GroupBoardFragments = {
  general: gql`
  fragment GroupBoardParts on GroupBoard {
    idBoard,
    id @client
    lanes
    {
      idLane,
      id @client
      laneId @client
      addModalText @client
      editModalText @client
      title
      disallowAddingCard @client
      laneType
      cards {
        idCard,
        attachementCount @client,
        id @client
        cardId @client
        laneId @client
        date @client
        description,
        createdAt,
        creator {
          idUser,
          id @client
          firstname,
          lastname,
        }
        libElements {
          idLibElement
          playerPath
          playerType
          metaData {
            idMetaData
            title
            shortTitle
            interpreter{
              idInterpreter
              name
            }
            composer {
              idComposer
              firstname
              lastname
            }
          }
        }
        lane {
          idLane
          id @client,
        }
        author @client
      }
    }
  }`,
};
export const GroupFragments = {
  general: gql`
  fragment GroupParts on Group {
    idGroup,
    id @client,
    name,
    matrixRoomId
    type @client,
    relations {
      idRelation
      idCompound
      id @client
      isConfirmed
      userRole
      relatedUserRole
      isConfirmed,
      matrixRoomId
      relatedUser{
        idUser,
        id @client
        firstname,
        lastname,
        matrixUserName
      }
    }
  }`,
};

export const TimetableFragments = {
  timeslot: gql`
  fragment TimeslotParts on Timeslot {
      idTimeslot
      id @client
      time
      group {
        idGroup
        id @client
        name
        }
      user {
        idUser
        id @client
        firstname
        lastname
        fullname @client
      }
  }`,
};

export default { UserFragments };
