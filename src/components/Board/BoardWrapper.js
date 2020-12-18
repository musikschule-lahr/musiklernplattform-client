/* eslint-disable react/forbid-prop-types */
import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  useQuery, useMutation,
} from '@apollo/client';
import Board from 'react-trello';
import {
  TrelloComponents,
  IconButton,
} from 'musiklernplattform-components';
import AddCircleOutlineIcon from '@iconify/icons-ion/add-circle-outline';
import { GET_USER } from '~/constants/gql/user';
import { formatDate, plans } from '~/constants/util';
import CardDetailModal from './CardDetailModal';
import ChoiceModal from '~/components/Generic/ChoiceModal';

import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import { usePlans } from '~/constants/hooks';

const BoardWrapper = ({
  getBoardQuery,
  boardSubscription,
  getBoardVariables,
  moveCardMutation,
  addCardMutation,
  addCardVariables,
  updateCardMutation,
  removeCardMutation,
  subscriptionVariables,
  allowedAddCardLaneTypes,
  isOwnBoard, cardDraggable,
}) => {
  const { comparePlans } = usePlans();

  const [boardData, setBoardData] = useState(null);
  const [newData, setNewData] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [eventBus, setEvBus] = useState(null);
  const [showAddCardModal, setShowAddCardModal] = useState(null);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);

  const currentAddCardHeading = useRef('To Do erstellen');
  const deleteCardModalData = useRef(null);
  const lastRemoved = useRef(null);
  const movedCardData = useRef();
  const doRefresh = useRef(false);
  const laneToAdd = useRef(null);
  const isCardDragging = useRef(false);

  const {
    data: userData,
  } = useQuery(GET_USER);

  const setEventBus = (handle) => {
    setEvBus(() => handle);
  };

  const getErrorMsg = (err) => {
    // TODO: With err code
    if (err.message.toLowerCase().includes('not authorised')) {
      return 'Du hast keine Berechtigung, diese Aktion auszuführen.';
    }
    return 'Es ist ein Fehler aufgetreten.';
  };

  function getLaneTitle(title, laneId, shouldAdd, addModalText) {
    return (
      <div style={{
        display: 'flex', width: '100%', justifyContent: 'space-between', cursor: 'initial',
      }}
      >
        {title}
        {shouldAdd && (
        <IconButton
          icon={AddCircleOutlineIcon}
          onClickHandler={() => {
            laneToAdd.current = laneId;
            currentAddCardHeading.current = addModalText;
            setShowAddCardModal(true);
          }}
        />
        )}
      </div>
    );
  }

  const {
    loading, error, data, subscribeToMore, refetch,
  } = useQuery(getBoardQuery, {
    variables: getBoardVariables || {},
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: (result) => {
      const boardResult = JSON.parse(JSON.stringify(data[Object.keys(result)[0]]));
      if (isOwnBoard && comparePlans([plans.TEACHER])) {
        boardResult.lanes = boardResult.lanes.filter((lane) => lane.laneType !== 'Done');
        const idx = boardResult.lanes.findIndex((lane) => lane.laneType === 'ToDo');
        boardResult.lanes[idx].title = 'Mein To Do';
      }
      boardResult.lanes = boardResult.lanes.map((lane) => (
        {
          ...lane,
          disallowAddingCard: true,
          title: getLaneTitle(lane.title,
            lane.id,
            allowedAddCardLaneTypes.includes(lane.laneType),
            lane.addModalText),
        }));
      setBoardData(boardResult);
    },
  });
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
    if (!loading && data && doRefresh.current) {
      doRefresh.current = false;
      setBoardData(JSON.parse(JSON.stringify(data[Object.keys(data)[0]])));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, doRefresh.current]);

  useEffect(() => {
    if (userData && boardSubscription) {
      subscribeToMore({
        document: boardSubscription,
        variables: subscriptionVariables || { userId: parseInt(userData.getUser.id, 10) },
        updateQuery: (prev, { subscriptionData }) => {
          doRefresh.current = true;
          refetch();
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    if (newData !== null) {
      // No need to update cache, for subscriptions we always fetch board anew anyway -> apollo refetch requirement
      /*
      const myData = {};
      myData[getBoardResultType] = boardData;
      const newQuery = { query: getBoardQuery, data: {} };
      newQuery.data[key] = { ...boardData };
      if (getBoardVariables) {
        // Deep Nested im Cache aktualisiert noch nicht egal wie feingranular
        // man merge definiert, ähnelt: https://github.com/apollographql/apollo-client/issues/6136
        // client.cache.evict(`${newData.__typename}:${getBoardVariables.id}`);
        // falls gruppe -> andere müssen geupdated werden...
      }
      client.writeQuery({
        query: getBoardQuery,
        variables: getBoardVariables || {},
        data: newData,
      }); */
      setBoardData(newData);
      setNewData(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newData]);

  const [moveCard, { loading: loadingMoveCard }] = useMutation(
    moveCardMutation,
    {
      update: (cache, { data: result }) => {
        setErrorMsg('');
        // Wir müssen das tun, da onClickListener nicht mehr gehen, wenn Lanes getauscht werden
        // ggf: Conditional wenn laneId unterschiedlich sind
        const fullData = { ...boardData };
        const foundFrom = fullData.lanes.findIndex(
          (lane) => lane.id === movedCardData.current.sourceLaneId,
        );
        let foundTo = foundFrom;
        if (movedCardData.current.sourceLaneId !== movedCardData.current.targetLaneId) {
          foundTo = fullData.lanes.findIndex(
            (lane) => lane.id === movedCardData.current.targetLaneId,
          );
        }
        const cardIndex = fullData.lanes[foundFrom].cards.findIndex(
          (card) => card.id === movedCardData.current.cardId,
        );
        const card = fullData.lanes[foundFrom].cards[cardIndex];
        fullData.lanes[foundFrom].cards.splice(
          cardIndex,
          1,
        );
        fullData.lanes[foundTo].cards.splice(
          movedCardData.current.position,
          0,
          card,
        );
        setNewData(fullData);
      },
      onError: (err) => {
        setErrorMsg(getErrorMsg(err));
        eventBus.publish({ type: 'UPDATE_LANES', lanes: boardData.lanes });
      },
    },
  );

  const [addCard, { loading: loadingAddCard }] = useMutation(
    addCardMutation, {
      update: (cache, { data: result }) => {
        setErrorMsg('');
        const fullData = { ...boardData };
        const addedCard = result[Object.keys(result)[0]];
        const found = fullData.lanes.findIndex(
          (lane) => lane.id === String(addedCard.lane.idLane),
        );
        delete addedCard.lane;
        fullData.lanes[found].cards.push({
          ...addedCard,
          id: String(addedCard.idCard),
          date: formatDate(addedCard.createdAt),
          author: `${addedCard.creator.firstname} ${addedCard.creator.lastname}`,
        });
        //   fullData.__typename = boardTypeName; // 'UserBoard';
        setNewData(fullData);
      },
      onError: ((err) => {
        setErrorMsg(getErrorMsg(err));
        eventBus.publish({ type: 'UPDATE_LANES', lanes: boardData.lanes });
      }),
    },
  );
  const [updateCard, { loading: loadingUpdateCard }] = useMutation(
    updateCardMutation, {
      update: (cache, { data: result }) => {
        setErrorMsg('');
        const fullData = { ...boardData };
        const updateCardContent = result[Object.keys(result)[0]];
        fullData.lanes.forEach((lane, laneIdx) => {
          lane.cards.forEach((card, cardIdx) => {
            if (card.idCard === updateCardContent.idCard) {
              fullData.lanes[laneIdx].cards[cardIdx] = {
                ...card,
                ...updateCardContent,
                id: String(card.idCard),
              };
            }
          });
        });
        setNewData(fullData);
      },
      onError: ((err) => {
        setErrorMsg(getErrorMsg(err));
        eventBus.publish({ type: 'UPDATE_LANES', lanes: boardData.lanes });
      }),
    },
  );
  const [removeCard, { loading: loadingRemoveCard }] = useMutation(
    removeCardMutation, {
      update: (cache, { data: result }) => {
        setErrorMsg('');
        const fullData = { ...boardData };
        fullData.lanes.forEach((lane, laneIdx) => {
          lane.cards.forEach((card, cardIdx) => {
            if (card.id === String(lastRemoved.current)) {
              fullData.lanes[laneIdx].cards.splice(cardIdx, 1);
            }
          });
        });
        lastRemoved.current = null;
        setNewData(fullData);
      },
      onError: ((err) => {
        setErrorMsg(getErrorMsg(err));
        eventBus.publish({ type: 'UPDATE_LANES', lanes: boardData.lanes });
      }),
    },
  );
  if (error) return 'error...';

  if (!boardData || loading || loadingAddCard || loadingUpdateCard || loadingRemoveCard) return <LoadingIndicator />;

  function handleDragEnd(cardId, sourceLaneId, targetLaneId, position) {
    const variables = {
      variables: {
        cardid: parseInt(cardId, 10),
        lanefromid: parseInt(sourceLaneId, 10),
        lanetoid: parseInt(targetLaneId, 10),
        cardlanesorting: position,
      },
    };
    movedCardData.current = {
      cardId, sourceLaneId, targetLaneId, position,
    };
    moveCard(
      variables,
    );
  }

  function onCardAdd(title, description) {
    setShowAddCardModal(false);
    const laneId = laneToAdd.current;
    laneToAdd.current = null;
    // Alternative: eventBus.publish({type: 'ADD_CARD', laneId: 'COMPLETED', card: {}})...
    const laneIdx = boardData.lanes.findIndex((lane) => (parseInt(lane.id, 10) === parseInt(laneId, 10)));
    const variables = {
      variables: {
        laneid: parseInt(laneId, 10),
        cardlanesorting: boardData.lanes[laneIdx].cards.length + 1,
        // title,
        description,
      },
    };
    if (addCardVariables !== null) {
      variables.variables = { ...variables.variables, ...addCardVariables };
    }
    addCard(
      variables,
    );
  }

  const onCardDelete = (cardId) => {
    deleteCardModalData.current = {
      message: 'Bist du sicher, dass du diesen Eintrag löschen möchtest?',
      headerMsg: 'Achtung',
      onSubmit: () => {
        setShowDeleteCardModal(false);
        setEditingCardId(null);
        lastRemoved.current = cardId;
        removeCard({
          variables: {
            cardId: parseInt(cardId, 10),
          },
        });
      },
      onClose: () => {
        setShowDeleteCardModal(false);
        eventBus.publish({ type: 'UPDATE_LANES', lanes: boardData.lanes });
      },
    };
    setShowDeleteCardModal(true);
  };

  function onCardUpdate(title, description, cardId) {
    if (description && cardId) {
      updateCard({
        variables: {
          cardId: parseInt(cardId, 10),
          //  title,
          description,
        },
      });
    }
    setEditingCardId(null);
  }

  function onCardClick(cardId, metadata, laneId) {
    const laneData = boardData.lanes.find((lane) => lane.id === laneId);
    if (!laneData) {
      setEditingCardId(null);
      return;
    }

    const cardData = laneData.cards.find((card) => card.id === cardId);
    if (!cardData) {
      setEditingCardId(null);
      return;
    }
    setErrorMsg('');
    setEditingCardId({
      canEdit: (cardData.creator.idUser === userData.getUser.idUser),
      cardId,
      attachments: (cardData.libElements || []).map((elem) => ({ ...elem, attachmentType: 'libElement' })),
      // title: cardData.title,
      description: cardData.description,
      heading: laneData.editModalText || 'To Do bearbeiten',
    });
  }

  const closeModal = () => {
    setEditingCardId(null);
  };
  const closeAddCardModal = () => {
    setShowAddCardModal(false);
  };

  if (error) {
    if (error === 'UNAUTHORIZED') {
      return 'Du hast keine Berechtigung, diese Aktion auszuführen.';
    }
    return `Error! ${error.message}`;
  }
  return (
    <div
      className="BoardWrapper"
    >
      {showAddCardModal
      && (
      <CardDetailModal
        canEdit
        onClose={closeAddCardModal}
        onSubmit={onCardAdd}
        heading={currentAddCardHeading.current}
      />
      )}
      {editingCardId && (
        <CardDetailModal
          attachments={editingCardId.attachments}
          canEdit={editingCardId.canEdit}
          cardId={editingCardId.cardId}
          description={editingCardId.description}
         // title ={editingCardId.title}
          onClose={closeModal}
          onSubmit={onCardUpdate}
          onDelete={onCardDelete}
          heading={editingCardId.heading}
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
      {errorMsg && <div className="errorField">{errorMsg}</div>}
      {boardData
        && (
          <Board
            editable
            data={boardData}
            laneDraggable={false}
            cardDraggable={cardDraggable}
            eventBusHandle={setEventBus}
            handleDragStart={() => { isCardDragging.current = true; }}
            handleDragEnd={(...args) => handleDragEnd(...args)}
            onCardDelete={onCardDelete}
            onCardClick={onCardClick}
            hideCardDeleteIcon
            components={TrelloComponents}
          />
        )}

    </div>
  );
};

BoardWrapper.propTypes = {
  getBoardQuery: PropTypes.object.isRequired,
  getBoardVariables: PropTypes.object,
  moveCardMutation: PropTypes.object.isRequired,
  addCardMutation: PropTypes.object.isRequired,
  addCardVariables: PropTypes.object,
  updateCardMutation: PropTypes.object.isRequired,
  removeCardMutation: PropTypes.object.isRequired,
  boardSubscription: PropTypes.object,
  subscriptionVariables: PropTypes.object,
  allowedAddCardLaneTypes: PropTypes.arrayOf(PropTypes.string),
  isOwnBoard: PropTypes.bool,
  cardDraggable: PropTypes.bool,
};

BoardWrapper.defaultProps = {
  getBoardVariables: {},
  addCardVariables: {},
  subscriptionVariables: null,
  boardSubscription: null,
  allowedAddCardLaneTypes: [],
  isOwnBoard: false,
  cardDraggable: true,
};

export default BoardWrapper;
