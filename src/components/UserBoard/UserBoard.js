import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ProfilIcon from 'musiklernplattform-components/iconify/icon-mein-profil-active';
import {
  useHistory,
} from 'react-router-dom';
import {
  USERBOARD_GET_EXTERNALCARD_SUBSCRIPTION,
  GET_BOARD,
  MOVE_CARD,
  ADD_USER_CARD,
  UPDATE_CARD,
  REMOVE_CARD,
} from '~/constants/gql/board';
import BoardWrapper from '~/components/Board/BoardWrapper';
import { generateActionItem } from '~/constants/util';
import ChatBoard from '~/components/Generic/ChatContainer/ChatRoomList';
import {getContentHeight} from '~/constants/util';

const UserBoard = ({ setActionItems }) => {
  const history = useHistory();

  useEffect(() => {
    setActionItems(
      generateActionItem(ProfilIcon, true, 'Mein Profil',
        () => history.push('/board/profile')),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="userBoard">
      <div className="userBoard-chat"
      style={{height: getContentHeight()}}><ChatBoard  /></div>
     <div className="userBoard-board"><BoardWrapper

        isOwnBoard
        getBoardQuery={GET_BOARD}
        getBoardResultType="getMyUserBoard"
        moveCardMutation={MOVE_CARD}
        addCardMutation={ADD_USER_CARD}
        updateCardMutation={UPDATE_CARD}
        boardSubscription={USERBOARD_GET_EXTERNALCARD_SUBSCRIPTION}
        removeCardMutation={REMOVE_CARD}
        boardTypeName="UserBoard"
        allowedAddCardLaneTypes={['ToDo', 'Other']}
      /></div>
    </div>

  );
};
UserBoard.propTypes = {
  setActionItems: PropTypes.func,
};

UserBoard.defaultProps = {
  setActionItems: null,
};

export default UserBoard;
