import React, { useEffect } from 'react';
import {
  useQuery,
} from '@apollo/client';
import {
  useParams, useHistory,
} from 'react-router-dom';
import PersonIcon from '@iconify/icons-ion/person';
import PropTypes from 'prop-types';
import UserBoardRoom from '~/components/Generic/ChatContainer/SingleChatRoom';
import {getContentHeight} from '~/constants/util';

import BoardWrapper from '~/components/Board/BoardWrapper';
import {
  GET_BOARD_BY_ID,
  MOVE_CARD,
  ADD_USER_CARD,
  UPDATE_CARD,
  REMOVE_CARD,
  USERBOARD_GET_BOARD_SUBSCRIPTION,
} from '~/constants/gql/board';
import {
  GET_ALL_CONFIRMED_RELATIONS_WITH_USER,
} from '~/constants/gql/relations';
import {
  GET_USER_BY_ID,
} from '~/constants/gql/user';
import {
  generateActionItem,
} from '~/constants/util';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const UserBoard = ({
  setHeading, setBackBtnPath, setBackBtnText, setActionItems, setShowBackBtn,
}) => {
  const { id } = useParams();
  const history = useHistory();

  const {
    data, loading, error,
  } = useQuery(GET_USER_BY_ID, {
    variables: { userId: parseInt(id, 10) },
    onCompleted: (data) => {
      setHeading(`${data.getUserFromId.firstname} ${data.getUserFromId.lastname}`);
    },
    onError: (err) => {
      console.log(err);
    },
  });
  const {
    data: relationData, loading: loadingRelation,
  } = useQuery(GET_ALL_CONFIRMED_RELATIONS_WITH_USER, {
    variables: { userId: parseInt(id, 10) },
    onError: (err) => {
      console.log(err);
    },
  });
  useEffect(() => {
    setShowBackBtn(true);
    setBackBtnText('Stundenplan');
    setBackBtnPath('/timetable');
    setActionItems(
      generateActionItem(PersonIcon, true, 'Schülerverwaltung',
        () => history.push(`/management/detail/user:${id}`)),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //
  if (error) return <div>Diese Seite konnte nicht gefunden werden...</div>;
  if (loading || loadingRelation) return <LoadingIndicator />;
  return (
    <div className="userBoard">
      {(relationData.getMyConfirmedRelationsWithUser.length > 0)
       &&  <div  style={{height: getContentHeight()}} className="userBoard-chat"><UserBoardRoom roomId={relationData.getMyConfirmedRelationsWithUser[0].matrixRoomId} /></div>}
      <div className="userBoard-board"> <BoardWrapper
        getBoardQuery={GET_BOARD_BY_ID}
        getBoardVariables={{ userid: parseInt(id, 10) }}
        getBoardResultType="getUserBoardFromUser"
        moveCardMutation={MOVE_CARD}
        addCardMutation={ADD_USER_CARD}
        updateCardMutation={UPDATE_CARD}
        removeCardMutation={REMOVE_CARD}
        boardSubscription={USERBOARD_GET_BOARD_SUBSCRIPTION}
        subscriptionVariables={{ userId: parseInt(id, 10) }}
        boardTypeName="UserBoard"
        cardDraggable={false}
        allowedAddCardLaneTypes={['ToDo']}
      /></div>
    </div>
  );
};

UserBoard.propTypes = {
  setHeading: PropTypes.func,
  setBackBtnPath: PropTypes.func,
  setBackBtnText: PropTypes.func,
  setActionItems: PropTypes.func,
};

UserBoard.defaultProps = {
  setHeading: null,
  setBackBtnPath: null,
  setBackBtnText: null,
  setActionItems: null,
};

export default UserBoard;
