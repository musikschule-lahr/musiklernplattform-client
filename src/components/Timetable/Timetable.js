import React, {
  useState, useEffect, useRef,
} from 'react';
import Board from 'react-trello';
import PropTypes from 'prop-types';
import { TrelloTimetableComponents } from 'musiklernplattform-components';
import moment from 'moment';
import TimeslotForm from './TimeslotForm';
import TimeslotEditForm from './TimeslotEditForm';
import { getDayFromEnum } from '~/constants/util';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import ChoiceModal from '~/components/Generic/ChoiceModal';

const Timetable = ({
  setNextLesson,
  newData, onCardClick, errorMessage, addTimeslotGroupFunc, addTimeslotUserFunc, findSpliceLocation,
  onCardDeleteFunc, updateTimeslotFunc, doOpenAddCardWithData, closeAddCard,
}) => {
  const [addDialogOpen, setaddDialogOpen] = useState(false);
  const [boardData, setBoardData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [eventBus, setEventBus] = useState();
  const [selectedDialogDay, setSelectedDialogDay] = useState(null);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);

  const deleteCardModalData = useRef(null);
  const isCardDragging = useRef(false);
  const selectedEdit = useRef({});

  useEffect(() => {
    if (newData != null && !boardData) {
      setBoardData(newData);
    }
  }, [newData, boardData]);

  useEffect(() => {
    if (setNextLesson != null) {
      if (setNextLesson.old.card) {
        if (eventBus) {
          const { timetableActive, ...rest } = setNextLesson.old.card;
          eventBus.publish({
            type: 'UPDATE_CARD',
            laneId: setNextLesson.old.card.laneId,
            card: {
              timetableActive: false,
              ...rest,
            },
          });
          const { timetableActive: active, ...newRest } = setNextLesson.new.card;
          eventBus.publish({
            type: 'UPDATE_CARD',
            laneId: setNextLesson.new.card.laneId,
            card: {
              timetableActive: true,
              ...newRest,
            },
          });
        }
      }
    }
  }, [setNextLesson, eventBus]);
  useEffect(() => {
    if (addDialogOpen === false) {
      closeAddCard();
    }
  }, [addDialogOpen, closeAddCard]);

  const stopevtn = (e) => {
    if (isCardDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  useEffect(() => {
    window.addEventListener('touchmove', stopevtn, { passive: false });
    window.addEventListener('touchforcechange', stopevtn, { passive: false });

    window.ontouchend = () => {
      isCardDragging.current = false;
    };
    return (() => {
      window.removeEventListener('touchmove', stopevtn);
      window.removeEventListener('touchforcechange', stopevtn);
    });
  }, []);

  useEffect(() => {
    if (doOpenAddCardWithData !== null) {
      setSelectedDialogDay(doOpenAddCardWithData);
      setaddDialogOpen(true);
    }
  }, [doOpenAddCardWithData]);

  const setNewEventBus = (handle) => {
    setEventBus(handle);
  };

  function onCardDelete() {
    const { cardId } = selectedEdit.current.last;
    deleteCardModalData.current = {
      message: 'Bist du sicher, dass du diesen Eintrag löschen möchtest?',
      headerMsg: 'Achtung',
      onSubmit: () => {
        setEditDialogOpen(false);
        setShowDeleteCardModal(false);
        let lastRemoved = null;
        boardData.lanes.some((day, dayIndex) => {
          day.cards.some((card, cardIndex) => {
            if (card.id === cardId) lastRemoved = { day: dayIndex, card: cardIndex };
            return card.id === cardId;
          });
          return lastRemoved !== null;
        });
        onCardDeleteFunc({
          variables:
          { timeslotId: parseInt(boardData.lanes[lastRemoved.day].cards[lastRemoved.card].timeslotId, 10) },
        }, lastRemoved);
      },
      onClose: () => {
        setShowDeleteCardModal(false);
      },
    };
    setShowDeleteCardModal(true);
  }

  function addTimeslot(timeslotValue, userGroupValue, dayId) {
    setaddDialogOpen(false);
    if (userGroupValue.type === 'group') {
      const variables = {
        variables: {
          dayid: parseInt(dayId, 10),
          time: `${moment(timeslotValue, 'HH:mm').format('HH:mm:ss')}Z`,
          groupid: parseInt(userGroupValue.id, 10),
        },
      };
      addTimeslotGroupFunc(variables, selectedDialogDay);
    } else if (userGroupValue.type === 'user') {
      const variables = {
        variables: {
          dayid: parseInt(dayId, 10),
          time: `${moment(timeslotValue, 'HH:mm').format('HH:mm:ss')}Z`,
          userid: parseInt(userGroupValue.id, 10),
        },
      };
      addTimeslotUserFunc(variables, selectedDialogDay);
    }
  }

  const openEditDialog = (cardId, sourceLaneId, targetLaneId, position, cardDetails) => {
    selectedEdit.current = {
      title: `Eintrag von ${cardDetails.description} bearbeiten`,
      message: `Der Eintrag von ${cardDetails.description} (zuvor ${
        getDayFromEnum(sourceLaneId)} - ${cardDetails.title}) wird nach ${
        getDayFromEnum(targetLaneId)} verschoben.`,
      day: getDayFromEnum(targetLaneId),
      timeslotInitial: cardDetails.title,
      last: {
        cardId, sourceLaneId, targetLaneId, position, cardDetails,
      },
    };
    setEditDialogOpen(true);
  };

  const submitEdit = (newTime) => {
    const foundLane = boardData.lanes.find((lane) => lane.id === selectedEdit.current.last.targetLaneId);
    const variables = {
      timeslotId: parseInt(selectedEdit.current.last.cardDetails.timeslotId, 10),
      dayid: parseInt(foundLane.linkedId, 10),
      time: `${moment(newTime, 'HH:mm').format('HH:mm:ss')}Z`,
    };

    const board = { ...boardData };
    let laneIdx;
    let cardIdx;
    let isResult;
    board.lanes.some((lane, laneIndex) => {
      laneIdx = laneIndex;
      lane.cards.some((card, cardIndex) => {
        cardIdx = cardIndex;
        isResult = card.id === selectedEdit.current.last.cardId;
        return isResult;
      });
      return isResult;
    });
    let targetLaneIdx;
    if (selectedEdit.current.sourceLaneId !== selectedEdit.current.last.targetLaneId) {
      targetLaneIdx = board.lanes.findIndex((lane) => lane.id === selectedEdit.current.last.targetLaneId);
    } else {
      targetLaneIdx = laneIdx;
    }
    const splicedCard = board.lanes[laneIdx].cards[cardIdx];
    splicedCard.title = newTime;
    splicedCard.timetableActive = false;
    board.lanes[laneIdx].cards.splice(cardIdx, 1);
    const place = findSpliceLocation(board.lanes[targetLaneIdx].cards,
      moment(newTime, 'HH:mm'));
    const findReferencesPlaceCards = [...boardData.lanes[targetLaneIdx].cards];
    findReferencesPlaceCards.splice(selectedEdit.current.position, 0, splicedCard);
    board.lanes[targetLaneIdx].cards.splice(place, 0, splicedCard);
    const { title, timetableActive, ...lastDetails } = selectedEdit.current.last.cardDetails;
    eventBus.publish({
      type: 'UPDATE_CARD',
      laneId: selectedEdit.current.last.targetLaneId,
      card: {
        id: selectedEdit.current.last.cardId,
        title: newTime,
        timetableActive: false,
        ...lastDetails,
      },
    });

    eventBus.publish({
      type: 'MOVE_CARD',
      fromLaneId: selectedEdit.current.last.targetLaneId,
      toLaneId: selectedEdit.current.last.targetLaneId,
      cardId: selectedEdit.current.last.cardId,
      index: place,
    });
    setEditDialogOpen(false);
    updateTimeslotFunc({ variables }, board);
  };

  const closeEdit = () => {
    const foundLane = boardData.lanes.find((lane) => lane.id === selectedEdit.current.last.sourceLaneId);
    const foundIdx = foundLane.cards.findIndex((card) => card.id === selectedEdit.current.last.cardId);
    eventBus.publish({
      type: 'MOVE_CARD',
      fromLaneId: selectedEdit.current.last.targetLaneId,
      toLaneId: selectedEdit.current.last.sourceLaneId,
      cardId: selectedEdit.current.last.cardId,
      index: foundIdx,
    });
    setEditDialogOpen(false);
  };

  if (!boardData) return <LoadingIndicator />;

  return (
    <div className="timetable">
      {errorMessage && <div className="errorField">{errorMessage}</div>}
      {addDialogOpen && (
        <TimeslotForm
          day={selectedDialogDay.title}
          onFormSubmit={
            (timeslotValue, userGroupValue) => addTimeslot(timeslotValue, userGroupValue, selectedDialogDay.dayId)
          }
          onClose={() => setaddDialogOpen(false)}
        />
      )}
      {editDialogOpen && (
        <TimeslotEditForm
          headerMsg={selectedEdit.current.title}
          onSubmit={submitEdit}
          onDelete={onCardDelete}
          onClose={closeEdit}
          message={selectedEdit.current.message}
          day={selectedEdit.current.day}
          timeslotInitial={selectedEdit.current.timeslotInitial}
        />
      )}
      {showDeleteCardModal
      && (
      <ChoiceModal
        headerMsg={deleteCardModalData.current.headerMsg}
        message={deleteCardModalData.current.message}
        onClose={deleteCardModalData.current.onClose}
        onSubmit={deleteCardModalData.current.onSubmit}
        submitText="OK"
        closeText="Abbrechen"
      />
      )}
      <Board
        editable={false}
        draggable={false}
        cardDraggable
        handleDragEnd={openEditDialog}
        data={boardData}
        onCardDelete={onCardDelete}
        hideCardDeleteIcon
        handleDragStart={() => { isCardDragging.current = true; }}
        onCardClick={onCardClick}
        components={TrelloTimetableComponents}
        eventBusHandle={setNewEventBus}
      />
    </div>
  );
};

Timetable.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  setNextLesson: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newData: PropTypes.object,
  onCardClick: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  addTimeslotGroupFunc: PropTypes.func.isRequired,
  addTimeslotUserFunc: PropTypes.func.isRequired,
  findSpliceLocation: PropTypes.func.isRequired,
  onCardDeleteFunc: PropTypes.func.isRequired,
  updateTimeslotFunc: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  doOpenAddCardWithData: PropTypes.object,
  closeAddCard: PropTypes.func.isRequired,
};

Timetable.defaultProps = {
  newData: null,
  errorMessage: null,
  doOpenAddCardWithData: null,
};
export default Timetable;
