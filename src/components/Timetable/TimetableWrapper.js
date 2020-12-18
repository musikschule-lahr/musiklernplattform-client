import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import {
  useMutation,
  useApolloClient,
} from '@apollo/client';
import PropTypes from 'prop-types';
import AddCircleOutlineIcon from '@iconify/icons-ion/add-circle-outline';
import { IconButton } from 'musiklernplattform-components';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import {
  GET_TIMETABLE,
  ADD_TIMESLOT_GROUP,
  REMOVE_TIMESLOT,
  ADD_TIMESLOT_USER,
  UPDATE_TIMESLOT_TIME,
} from '~/constants/gql/timetable';
import {
  ADD_TEACHER_TIMETABLE,
} from '~/constants/gql/relations';
import { GET_FORMATTED_TIMETABLE } from '~/constants/gql/cache';
import { useImperativeQuery } from '~/constants/hooks';
import { getDayFromEnum } from '~/constants/util';
import Timetable from './Timetable';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const TimetableWrapper = ({ setHeading, setActionItems, setShowBackBtn }) => {
  const client = useApolloClient();
  const history = useHistory();
  const getTimetable = useImperativeQuery(GET_TIMETABLE);

  const [boardData, setBoardData] = useState(null);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [doOpenAddCardWithData, setDoOpenAddCardWithData] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);

  const editedBoardData = useRef({});
  const selectedDay = useRef();
  const lastRemoved = useRef();
  const prevLesson = useRef({});

  const getLaneTitle = useCallback((title, dayId, dayIndex) => (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
      {title}
      <IconButton
        icon={AddCircleOutlineIcon}
        onClickHandler={() => {
          setDoOpenAddCardWithData({ title, dayId, dayIndex });
        }}
      />
    </div>
  ), []);

  const getNextLesson = useCallback((data) => {
    const now = moment.now();
    const day = moment(now).format('dddd');
    const editedData = { ...data };
    data.lanes.some((lane, index) => {
      if (lane.day === day) {
        lane.cards.some((card, cardIndex) => {
          const cardTime = moment(card.title, ['HH:mm']);
          if (cardTime.isAfter(now)) {
            if ((prevLesson.current.card || {}).id !== card.id) {
              setNextLesson(null);
              setNextLesson({
                old: { ...prevLesson.current },
                new: {
                  laneIndex: index,
                  cardIndex,
                  card,
                },
              });
              prevLesson.current = { laneIndex: index, cardIndex, card };
            }
            editedData.lanes[index].cards[cardIndex].timetableActive = true;
            if (editedData.lanes[index].cards[cardIndex + 1]) {
              // in case next card exists and got marked as existing we wanna remove active flag
              editedData.lanes[index].cards[cardIndex + 1].timetableActive = false;
            }
            return true;
          }
          // remove styling of possible cards before
          editedData.lanes[index].cards[cardIndex].timetableActive = false;
          return false;
        });
        return true;
      }
      return false;
    });
    return editedData;
  }, []);

  const formatTimetable = useCallback((data) => {
    const lanes = [];
    data.days.forEach((element, laneIndex) => {
      const { timeslots, day, id } = element;
      const cards = [];
      timeslots.forEach((card, cardIndex) => {
        let linkedId;
        let description;
        let group;
        const title = moment(card.time, ['HH:mm:ss']).format('HH:mm');
        if (card.user) {
          description = card.user.fullname;
          linkedId = card.user.id;
          group = false;
        } else if (card.group) {
          description = card.group.name;
          linkedId = card.group.idGroup;
          group = true;
        }
        cards.push({
          __typename: 'CachedTimeslot',
          type: (card.user ? 'user' : 'group'),
          title,
          description,
          id: `${element.day}_${cardIndex}`,
          linkedId,
          group,
          timeslotId: card.id,
        });
      });
      const thisDay = getDayFromEnum(day);
      const lane = {
        id: day,
        linkedId: id,
        cards,
        day: thisDay,
        title: getLaneTitle(thisDay, id, laneIndex),
      };
      lanes.push(lane);
    });
    client.writeQuery({
      query: GET_FORMATTED_TIMETABLE,
      data: {
        getFormattedTimetable: { lanes },
      },
    });
    const editedData = getNextLesson({ lanes });
    setBoardData(editedData);
  }, [client, getLaneTitle, getNextLesson]);

  const updateBoard = useCallback((newData) => {
    const nextData = getNextLesson({ ...newData });
    setBoardData(nextData);
    client.writeQuery({
      query: GET_FORMATTED_TIMETABLE,
      data: {
        __typename: 'TimetableData',
        getFormattedTimetable: { __typename: 'CachedTimetable', ...newData },
      },
    });
    setErrorMessage(null);
  }, [client, getNextLesson]);

  useEffect(() => {
    setHeading('Stundenplan');
    setShowBackBtn(false);
    setActionItems(
      null,
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function findSpliceLocation(list, newCardTime) {
    let place = list.length;
    list.some((card, index) => {
      const currentTime = moment(card.title, 'HH:mm');
      if (currentTime.isAfter(newCardTime)) {
        place = index;
      }
      return currentTime > newCardTime;
    });
    return place;
  }

  const [addTimeslotGroup, { loading: loadingAddCardGroup }] = useMutation(
    ADD_TIMESLOT_GROUP, {
      update: (cache, { data: result }) => {
        const newCard = result.addTimeslotGroup;
        const board = { ...boardData };
        const newTime = moment(newCard.time, ['HH:mm:ss']);
        const place = findSpliceLocation(boardData.lanes[selectedDay.current.dayIndex].cards, newTime);
        board.lanes[selectedDay.current.dayIndex].cards.splice(place, 0, {
          type: 'group',
          __typename: 'CachedTimeslot',
          title: newTime.format('HH:mm'),
          description: newCard.group.name,
          id: `1_${newTime.format('HHmm')}`,
          linkedId: newCard.group.idGroup,
          timeslotId: newCard.id,
          group: true,
        });
        updateBoard(board);
        selectedDay.current = null;
      },
      onError: (() => {
        setErrorMessage('Ein Fehler ist aufgetreten: Bitte versuche es nochmal.');
        updateBoard(boardData);
      }),
    },
  );

  const [addTimeslotUser, { loading: loadingAddCardUser }] = useMutation(
    ADD_TIMESLOT_USER, {
      update: (cache, { data: result }) => {
        const newCard = result.addTimeslotUser;
        const board = { ...boardData };
        const newTime = moment(newCard.time, ['HH:mm:ss']);
        const place = findSpliceLocation(boardData.lanes[selectedDay.current.dayIndex].cards, newTime);
        board.lanes[selectedDay.current.dayIndex].cards.splice(place, 0, {
          type: 'user',
          title: newTime.format('HH:mm'),
          description: `${newCard.user.firstname} ${newCard.user.lastname}`,
          id: `1_${newTime.format('HHmm')}`,
          timeslotId: newCard.id,
          linkedId: newCard.user.idUser,
          group: false,
        });
        updateBoard(board);
        selectedDay.current = null;
      },
      onError: (() => {
        setErrorMessage('Ein Fehler ist aufgetreten: Bitte versuche es nochmal.');
        updateBoard(boardData);
      }),
    },
  );

  const [removeTimeslot, { loading: loadingRemove }] = useMutation(
    REMOVE_TIMESLOT, {
      update: () => {
        const board = { ...boardData };
        board.lanes[lastRemoved.current.day].cards.splice(lastRemoved.current.card, 1);
        updateBoard(board);
        lastRemoved.current = null;
      },
      onError: (() => {
        setErrorMessage('Ein Fehler ist aufgetreten: Bitte versuche es nochmal.');
        updateBoard(boardData);
      }),
    },
  );

  const [updateTimeslot] = useMutation(
    UPDATE_TIMESLOT_TIME, {
      update: (cache, { data: result }) => {
        updateBoard(editedBoardData.current);
      //  eventBus.current.publish({ type: 'UPDATE_LANES', lanes: board.lanes });
      },
      onError: (() => {
        setErrorMessage('Ein Fehler ist aufgetreten: Bitte versuche es nochmal.');
        updateBoard(boardData);
      }),
    },
  );

  const queryTimetableData = useCallback(async () => {
    try {
      const timetable = await getTimetable();
      if (timetable.data) {
        if (timetable.data.getTimetable) {
          formatTimetable(timetable.data.getTimetable);
        } else {
          const addTT = await client.mutate({
            mutation: ADD_TEACHER_TIMETABLE,
          });
          if (addTT) {
            queryTimetableData();
          }
        }
      }
    } catch (e) {
      setError(true);
    }
  }, [getTimetable, formatTimetable, client]);

  useEffect(() => {
    try {
      if (!boardData) {
        const timetableData = client.readQuery({
          query: GET_FORMATTED_TIMETABLE,
        });
        if (timetableData) {
          const editedData = getNextLesson(JSON.parse(JSON.stringify(timetableData.getFormattedTimetable.lanes)));
          setBoardData(editedData);
        } else queryTimetableData();
      }
    } catch (e) {
      queryTimetableData();
    }
    // fire only once, one of the dependencies (probably client) is rerendering firing twice
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onCardClick(cardId, metadata, laneId) {
    const foundLane = boardData.lanes.find((lane) => lane.id === laneId);
    const foundCard = foundLane.cards.find((card) => card.id === cardId);
    history.push(`/timetable/${foundCard.type}/${foundCard.linkedId}`);
  }
  const onCardDelete = (variables, lastRemovedData) => {
    lastRemoved.current = lastRemovedData;
    removeTimeslot(variables);
  };
  const addTimeslotGroupFunc = (variables, newSelectedDay) => {
    selectedDay.current = newSelectedDay;
    addTimeslotGroup(
      variables,
    );
  };
  const addTimeslotUserFunc = (variables, newSelectedDay) => {
    selectedDay.current = newSelectedDay;
    addTimeslotUser(
      variables,
    );
  };

  const updateTimeslotFunc = (variables, neweditedBoardData) => {
    editedBoardData.current = neweditedBoardData;
    updateTimeslot(variables);
  };

  const closeAddCard = () => {
    setDoOpenAddCardWithData(null);
  };

  if (error) return <div>Diese Seite steht dir aktuell nicht zur Verfügung.</div>;

  if (!boardData || loadingAddCardGroup || loadingAddCardUser || loadingRemove) return <LoadingIndicator />;

  return (
    <Timetable
      newData={boardData}
      onCardClick={onCardClick}
      errorMessage={errorMessage}
      addTimeslotGroupFunc={addTimeslotGroupFunc}
      addTimeslotUserFunc={addTimeslotUserFunc}
      updateTimeslot={updateTimeslot}
      onCardDeleteFunc={onCardDelete}
      updateTimeslotFunc={updateTimeslotFunc}
      doOpenAddCardWithData={doOpenAddCardWithData}
      closeAddCard={closeAddCard}
      findSpliceLocation={findSpliceLocation}
      setNextLesson={nextLesson}
    />
  );
};

TimetableWrapper.propTypes = {
  setHeading: PropTypes.func,
};

TimetableWrapper.defaultProps = {
  setHeading: null,
};
export default TimetableWrapper;
