import React, { useEffect } from 'react';
import {
  useQuery, useApolloClient
} from '@apollo/client';
import PropTypes from 'prop-types';
import PeopleSharpIcon from '@iconify/icons-ion/people-sharp';
import {
  useParams,
  useHistory,
} from 'react-router-dom';
import BoardWrapper from '~/components/Board/BoardWrapper';
import {
  GET_GROUP_BOARD_BY_ID,
  MOVE_CARD,
  ADD_GROUP_CARD,
  UPDATE_CARD,
  REMOVE_CARD,
} from '~/constants/gql/board';
import {
  GET_GROUP,
} from '~/constants/gql/group';
import {checkGroupsAndAddRooms,
  generateActionItem,
} from '~/constants/util';
import GroupBoardRoom from '~/components/Generic/ChatContainer/SingleChatRoom';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import useMatrix from '~/components/MatrixProvider/useMatrix';
import {getContentHeight} from '~/constants/util';

// import getgroup für name

const GroupBoard = ({
  setActionItems, setHeading, setBackBtnPath, setBackBtnText, setShowBackBtn,
}) => {
  const { id } = useParams();
  const client = useApolloClient();
  const history = useHistory();
  const matrix = useMatrix();

  useEffect(() => {
    setShowBackBtn(true);
    setBackBtnText('Stundenplan');
    setBackBtnPath('/timetable');
    setActionItems(
      generateActionItem(
        PeopleSharpIcon, true, 'Gruppenverwaltung', () => history.push(`/management/detail/group:${id}`),
      ),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data, loading, error, refetch
  } = useQuery(GET_GROUP, {
    variables: { groupId: parseInt(id, 10) },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    onCompleted: (result) => {
      console.log("on completed")
      setHeading(result.getGroup.name);
      checkGroupsAndAddRooms(result.getGroup,matrix,client).then((addedNew) =>{
        if(addedNew) refetch();
      })
    },
    onError: (err) => {
      console.log(err);
    },
  });
  if (error) return <div>Diese Seite konnte nicht gefunden werden...</div>;
  if (loading) return <LoadingIndicator />;
  return (
    <div className="userBoard">
      {data.getGroup.matrixRoomId
      && <div  style={{height: getContentHeight()}} className="userBoard-chat"><GroupBoardRoom roomId={data.getGroup.matrixRoomId} /></div>}
      <div  className="userBoard-board">
        <BoardWrapper
        getBoardQuery={GET_GROUP_BOARD_BY_ID}
        getBoardVariables={{ groupid: parseInt(id, 10) }}
        getBoardResultType="getGroupBoard"
        moveCardMutation={MOVE_CARD}
        addCardMutation={ADD_GROUP_CARD}
        addCardVariables={{ groupid: parseInt(id, 10) }}
        updateCardMutation={UPDATE_CARD}
        removeCardMutation={REMOVE_CARD}
        boardTypeName="GroupBoard"
        movableCards
        allowedAddCardLaneTypes={['ToDo']}
      />
      </div>
    </div>
  );
};

GroupBoard.propTypes = {
  setHeading: PropTypes.func,
  setBackBtnPath: PropTypes.func,
  setBackBtnText: PropTypes.func,
  setActionItems: PropTypes.func,
};

GroupBoard.defaultProps = {
  setHeading: null,
  setBackBtnPath: null,
  setBackBtnText: null,
  setActionItems: null,
};

export default GroupBoard;
