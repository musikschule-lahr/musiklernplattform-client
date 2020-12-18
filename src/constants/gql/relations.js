import { gql } from '@apollo/client';
import { UserFragments, RelationFragments } from './fragments';

export const GET_CONFIRMED_STUDENTS = gql`
  query GetStudents{
    getMyConfirmedStudents
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const GET_UNCONFIRMED_LESSONS = gql`
  query GetUnconfirmedLessons{
    getMyUnconfirmedLessonStudents
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const GET_SINGLE_RELATION = gql`
  query GetSingleRelation(
          $relationId: Int!
      ){
    getSingleRelation(
          where: {id: $relationId}
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const GET_SINGLE_CHILD = gql`
  query GetSingleChild(
          $userId: Int!
      ){
    getSingleChild(
          user: {id: $userId}
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const GET_SINGLE_TEACHER_LESSON = gql`
  query GetSingleTeacherLesson(
          $userId: Int!
          $instrumentId: Int!
      ){
        getSingleTeacherFromLesson(
          user: {id: $userId}
          instrument: {id: $instrumentId}
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const GET_SINGLE_TEACHER_GROUP = gql`
  query GetSingleTeacherGroup(
          $userId: Int!
          $groupId: Int!
      ){
        getSingleTeacherFromGroup(
          user: {id: $userId}
          group: {id: $groupId}
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;
export const GET_SINGLE_OFFICE = gql`
  query GetSingleOffice(
          $userId: Int!
      ){
    getSingleOffice(
          user: {id: $userId}
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const GET_UNCONFIRMED_STUDENTS = gql`
  query GetUnconfirmedStudents{
    getMyUnconfirmedStudents
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;
export const GET_CONFIRMED_WITH_RELATED_STUDENT = gql`
  query GetConfirmedWithRelatedStudent($userId: Int!){
    getConfirmedWithRelatedStudent(
          where: {id: $userId}
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;
export const GET_CHILDREN = gql`
  query GetChildren{
    getMyChildren
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;
export const GET_TEACHERS = gql`
  query GetTeachers{
    getMyTeachers
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;
export const GET_STUDENT_TEACHERS = gql`
  query GetTeachers($userid: Int!){
    getStudentTeachers
      (
        where: {
          id: $userid
        }
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;
export const GET_STUDENT_PARENTS = gql`
  query GetParents($userid: Int!){
    getStudentParents
      (
        where: {
          id: $userid
        }
      )
      {
      ...MailPhoneRelationParts
    }
  }
  ${RelationFragments.withMailAndPhone}
`;

export const GET_PARENTS = gql`
  query GetParents{
    getMyParents
    {
      ...MailPhoneRelationParts
    }
  }
  ${RelationFragments.withMailAndPhone}
`;

export const GET_ALL_CONFIRMED_RELATIONS_WITH_USER = gql`
  query GetConfirmedRelationsWithUser(
          $userId: Int!
      ){
        getMyConfirmedRelationsWithUser(
          user: { id: $userId}
      )
      {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const GET_ONLY_GROUP_RELATED_STUDENTS = gql`
query GetMyOnlyGroupRelatedStudents(
        $groupId: Int!
    ){
      getMyOnlyGroupRelatedStudents(
        group: { id: $groupId}
    )
    {
      idCompound
      matrixRoomId
      relatedUser{
          idUser
          id @client
          firstname
          lastname
          matrixUserName
        }
  }
}
`;
export const ADD_TEACHED_INSTRUMENTS = gql`
  mutation AddTeachedInstruments (
    $instruments: [InstrumentInput!]
    ) {
      addTeachedInstruments (
      data:  $instruments,

    )
    {
      ...UserParts
    }
  }
  ${UserFragments.general}
`;
export const ADD_TEACHER_TIMETABLE = gql`
  mutation AddTeacherTimetable{
      addTeacherTimetable
  }
`;
export const REMOVE_TEACHED_INSTRUMENTS = gql`
mutation RemoveTeachedInstruments (
  $instruments: [InstrumentInput!]
  ) {
    removeTeachedInstruments (
    data:  $instruments,
  )
  {
      ...UserParts
    }
  }
  ${UserFragments.general}
`;

export const ADD_TEACHER_LESSON = gql`
  mutation AddTeacher (
    $user: UserInput!
    $instrument: InstrumentInput!
    ) {
      addTeacher (
        user: $user,
        instrument: $instrument
    )
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const ADD_TEACHER_GROUP = gql`
  mutation AddTeacherGroup (
    $user: UserInput!
    $group: GroupInput!
    ) {
      addTeacherGroup (
        user: $user,
        group: $group
    )
    {
      user{
        ...UserParts
      }
    }
  }
  ${UserFragments.general}
`;

export const ADD_CHILD = gql`
  mutation AddChild (
    $user: UserInput!
    ) {
      addChild (
        user: $user,
    )
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const ADD_OFFICE = gql`
  mutation AddOffice (
    $user: UserInput!
    ) {
      addOffice (
        user: $user,
    )
    {
      ...RelationParts
    }
  }
  ${RelationFragments.general}
`;

export const REMOVE_RELATION_FROM_USER = gql`
  mutation RemoveRelationFromUser (
    $relation: RelationInput!
    ) {
      removeRelationFromUser (
        where:$relation
    )
  }
`;
export const CONFIRM_RELATION_FROM_USER = gql`
  mutation ConfirmRelationFromUser (
    $relation: RelationInput!
    $time: DateTime!
    $room: String
    ) {
      confirmRelationFromUser (
        where:$relation,
        time: $time
        room: $room
    )
  }
`;

export const REMOVE_TEACHER_LESSON = gql`
  mutation RemoveTeacherLesson (
    $user: UserInput!
    $instrument: InstrumentInput!
    ) {
      removeTeacherRelation (
        user: $user,
        instrument: $instrument
    )
  }
`;
export const REMOVE_TEACHER_GROUP = gql`
  mutation RemoveTeacherGroup (
    $user: UserInput!
    $group: GroupInput!
    ) {
      removeTeacherGroupRelation (
        user: $user,
        group: $group
    )
  }
`;

export const REMOVE_STUDENT_LESSON = gql`
  mutation RemoveStudentLesson (
    $user: UserInput!
    $instrument: InstrumentInput!
    ) {
      removeStudentLessonRelation (
        user: $user,
        instrument: $instrument
    )
  }
`;

export const REMOVE_STUDENT_GROUP = gql`
  mutation RemoveStudentGroup (
    $user: UserInput!
    $group: GroupInput!
    ) {
      removeStudentGroupRelation (
        user: $user,
        group: $group
    )
  }
`;
export const REMOVE_PARENT = gql`
  mutation RemoveParent (
    $user: UserInput!
    ) {
      removeParentRelation (
        user: $user,
    )
  }
`;

export const CONFIRM_LESSON = gql`
  mutation ConfirmLesson (
    $data: [StudentInstrumentRelationInput!]
    $time: DateTime!
    $room: String
    ) {
      confirmStudentRelations (
        data: $data,
        time: $time,
        room: $room
    )
  }
`;
export const CONFIRM_PARENT = gql`
  mutation ConfirmParent (
    $user: UserInput!
    $time: DateTime!
    $room: String
    ) {
      confirmParentRelation (
        user: $user,
        time: $time,
        room: $room
    )
  }
`;
export const ADD_MATRIX_ROOMS = gql`
  mutation AddMatrixRooms (
    $user: UserInput!
    $room: String!
    ) {
      addMatrixRooms (
        user: $user,
        room: $room,
    )
  }
`;
// addMatrixRooms(user: UserInput!, room: String!): Boolean! @auth

export const RELATION_UNCONFIRMED_SUBSCRIPTION = gql`
subscription RelationUnconfirmedSubscription($userId: Int!){
  relationUnconfirmedSubscription(
  where: {
    id: $userId
  }
)
  {
    idRelation
    idUser
    idRelatedUser
    userRole
    relatedUserRole
    idInstrument
    idGroup
    isConfirmed
  }
}
`;

export const RELATION_CONFIRMED_SUBSCRIPTION = gql`
subscription RelationConfirmedSubscription($userId: Int!){
  relationConfirmedSubscription(
  where: {
    id: $userId
  }
)
  {
    idRelation
    idUser
    idRelatedUser
    userRole
    relatedUserRole
    idInstrument
    idGroup
    isConfirmed
  }
}
`;

export const RELATION_DELETED_SUBSCRIPTION = gql`
subscription RelationDeletedSubscription($userId: Int!){
  relationDeletedSubscription(
  where: {
    id: $userId
  }
)
  {
    idRelation
    idUser
    idRelatedUser
    userRole
    relatedUserRole
    idInstrument
    idGroup
    isConfirmed
  }
}
`;

export const RELATION_GROUP_DELETED_SUBSCRIPTION = gql`
subscription RelationGroupDeletedSubscription($groupId: Int!){
  relationGroupDeletedSubscription(
  where: {
    id: $groupId
  }
)
  {
    idRelation
    idUser
    idRelatedUser
    userRole
    relatedUserRole
    idGroup
    isConfirmed
  }
}
`;
export default {
  GET_CONFIRMED_STUDENTS,
  GET_UNCONFIRMED_LESSONS,
  GET_TEACHERS,
  GET_PARENTS,
  ADD_TEACHED_INSTRUMENTS,
  ADD_TEACHER_LESSON,
  ADD_CHILD,
  REMOVE_TEACHER_LESSON,
  REMOVE_PARENT,
  GET_CONFIRMED_WITH_RELATED_STUDENT,
};
