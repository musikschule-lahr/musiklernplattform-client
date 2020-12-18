import { gql } from '@apollo/client';

export const GET_LIB_ELEMENTS = gql`
query FilterLibElements(
  $title: String
){
  filterLibElements(
      filter: {
        title: $title
      }
    )
    {
      idLibElement
      productionNo
      playerPath
      playerType
      isFavorite @client
      instruments{
        idInstrument
        id @client
        name
      }
      tracks{
        title
        isVideo
        filePath
        sorting
      }
      metaData {
        idMetaData
        title
        shortTitle
        comment
        movement
tuning
        difficultyMin
        difficultyMax
        coverImagePath
        composer {
          idComposer
          firstname
          lastname
          yearOfBirth
          yearOfDeath
        }
        interpreter{
          idInterpreter
          name
        }
        epoch {
          idEpoch
          code
          description
        }
      }
    }
}
`;

export const SEARCH_LIB_ELEMENTS = gql`
query SearchLibElements(
  $text: String
  $difficulty: DifficultyInput
  $instruments: [InstrumentInput]
  $epochs: [EpochInput]
  $sorting: LibElementSortableInput
  $playerType: String
){
  filterLibElements(
      filter: {
        title: $text
        composer:{
          firstname: $text
          lastname: $text
        }
        interpreter: {
          name: $text
        }
        comment: $text
        difficulty: $difficulty
        instruments: $instruments
        epochs: $epochs
        playerType: $playerType
      }
      sorting: $sorting
    )
    {
      idLibElement
      productionNo
      playerPath
      playerType
      isFavorite @client
      instruments{
        idInstrument
        id @client
        name
      }
      tracks{
        title
        isVideo
        filePath
        sorting
      }
      metaData {
        idMetaData
        title
        shortTitle
        comment
        movement
        tuning
        difficultyMin
        difficultyMax
        coverImagePath
        interpreter{
          idInterpreter
          name
        }
        composer {
          idComposer
          firstname
          lastname
          yearOfBirth
          yearOfDeath
        }
        epoch {
          idEpoch
          code
          description
        }
      }
    }
}
`;

export const GET_LIB_ELEMENT_FROM_PATH = gql`
query GetLibElementFromPath(
  $path: String!
){
  getLibElementFromPath(
      where: {
        pathId: $path
      }
    )
    {
      idLibElement
      productionNo
      playerPath
      playerType
      isFavorite @client
      instruments{
        idInstrument
        id @client
        name
      }
      tracks{
        title
        isVideo
        filePath
        sorting
      }
      metaData {
        idMetaData
        title
        shortTitle
        comment
        movement
tuning
        difficultyMin
        difficultyMax
        coverImagePath
        composer {
          idComposer
          firstname
          lastname
          yearOfBirth
          yearOfDeath
        }
        interpreter{
          idInterpreter
          name
        }
        epoch {
          idEpoch
          code
          description
        }
      }
    }
}
`;

export const GET_EPOCHS = gql`
query GetEpochs{
  getEpochs
    {
          idEpoch
          code
          description
          selected @client
    }
}
`;

export default {
  GET_LIB_ELEMENTS, GET_LIB_ELEMENT_FROM_PATH,
};
