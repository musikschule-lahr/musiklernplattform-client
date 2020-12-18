import React, {
  useEffect, useRef, useReducer,
} from 'react';
import PropTypes from 'prop-types';
import { useKeycloak } from '@react-keycloak/web';
import qs from 'qs';
import * as sdk from 'matrix-js-sdk';
import { useQuery, useApolloClient } from '@apollo/client';
import MatrixContext from './MatrixContext';
import { GET_USER } from '~/constants/gql/user';
import { matrixConsts } from '~/constants/util';

function reducer(state, action) {
  if (action.addclient) {
    const {
      client, status, initialized, getRoomMembershipEvent: oldEvent, ...rest
    } = state;
    const { client: newClient, status: newStatus, getRoomMembershipEvent } = action.addclient;
    return {
      client: newClient, status: newStatus, initialized: true, getRoomMembershipEvent, ...rest,
    };
  }
  return state;
}
const MatrixProvider = ({ children }) => {
  const apolloClient = useApolloClient();
  const { keycloak, initialized } = useKeycloak();
  const initializing = useRef(false);
  const [state, dispatch] = useReducer(reducer, { client: null, initialized: false });

  const { loading, data: userData, error } = useQuery(GET_USER);
  console.log('userData', userData);
  const initializeMatrixClient = (loginToken) => {
    const gotClient = async (response) => {
      const client = sdk.createClient({
        baseUrl: process.env.MATRIX_BASE_URL,
        accessToken: response.data.access_token,
        userId: `@${keycloak.idTokenParsed.sub}`,
        timelineSupport: true,
        sessionStore: new sdk.WebStorageSessionStore(window.localStorage),
        //  cryptoStore: new sdk.MemoryCryptoStore(),
      });
      //  await client.initCrypto();

      client.startClient({ pendingEventOrdering: 'detached' }); // for sending read receipts
      if (userData)client.setDisplayName(`${userData.getUser.firstname} ${userData.getUser.lastname}`, () => {});
      const getRoomMembershipEvent = (usableClient) => {
        function memberEvent(event, member) {
          if (member.membership === 'invite' && member.userId === usableClient.getUserId()) {
            usableClient.joinRoom(member.roomId).then(() => {
            });
          }
          if (member.membership === 'leave') {
            if (member.userId === usableClient.getUserId()) {
              usableClient.forget(member.roomId);
              return;
            }
            // Idee: Über apollo cache lösen statt getRooms -> könnte schneller sein
            const rooms = usableClient.getRooms();
            const foundRoom = rooms.find((room) => room.summary.roomId === member.roomId);
            // 1:1 room was deleted
            const roomType = foundRoom.currentState.getStateEvents('m.room.topic', '').getContent().topic;
            if (roomType === matrixConsts.DIRECT_ROOM_TYPE
          || (roomType === matrixConsts.GROUP_ROOM_TYPE
            && member.powerLevel === matrixConsts.ADMIN_POWER_LEVEL)) {
              console.log('Someone Left a room: was direct or group admin, so leave too');
              usableClient.leave(member.roomId);
            }
          }
        }
        return memberEvent;
      };
      client.once('sync', (state, prevState, res) => {
        const roomMembershipEvent = getRoomMembershipEvent(client, apolloClient);
        // client.removeAllListeners();
        client.on('RoomMember.membership', (event, member) => { roomMembershipEvent(event, member); });

        // Sync mit vergangenen Events während offline geht nicht (mehr...?), darum prüfen wir manuell bei Startup
        // und aktualisieren die Raum-Mitgliedschaften
        const rooms = client.getRooms();
        rooms.forEach((room) => {
          switch (room.getMember(client.getUserId()).membership) {
            case 'join': {
              const type = room.currentState.getStateEvents('m.room.topic', '').getContent().topic;
              if (type === matrixConsts.DIRECT_ROOM_TYPE) {
                if (room.getInvitedAndJoinedMemberCount() < 2) {
                  client.leave(room.summary.roomId, () => {});
                }
              } else if (type === matrixConsts.GROUP_ROOM_TYPE) {
                const adminLeft = room.getMembersWithMembership('leave')
                  .some((item) => item.powerLevel === matrixConsts.ADMIN_POWER_LEVEL);
                if (adminLeft) {
                  client.leave(room.summary.roomId, () => {});
                }
              }
              break;
            }
            case 'invite': {
              console.log('invited -> join');
              client.joinRoom(room.summary.roomId).then(() => console.log('joined')).catch((err) => {
                // TODO: Check if request exists -> if not: leave, if yes: retry or error message
                console.log(err);
                client.leave(room.summary.roomId, () => { console.log('invite does not exist anymore, leaving...'); });
              });
              break;
            }
            case 'kick': {
              console.log('kicked -> forget');
              client.forget(room.summary.roomId, () => {});
              break;
            }
            case 'leave': {
              console.log('left -> forget');
              client.forget(room.summary.roomId, () => {});
              break;
            }
            default: {
              // ...
            }
          }
        });
        dispatch({ addclient: { client, status: state, getRoomMembershipEvent } });
      });

      window.history.pushState({}, document.title, `/#/${window.location.href.split('#/')[1] || ''}`);
    };
    window.cordova.plugin.http.sendRequest('https://yourDomain.com/_matrix/client/r0/login', {
      method: 'post',
      data: {
        type: 'm.login.token',
        token: loginToken,
      },
      serializer: 'json',
      responseType: 'json',
    }, gotClient, (response) => {
      const parsed = JSON.parse(response.error);
      if (parsed.errcode === 'M_FORBIDDEN') {
        localStorage.removeItem('matrixtoken');
        window.location.href = `https://yourDomain.com/_matrix/client/r0/login/sso/redirect?redirectUrl=${
          encodeURIComponent(window.location.href)}`;
      }
    });
  };
  useEffect(() => {
    if (initialized && keycloak.authenticated && !initializing.current && (userData || error)) {
      initializing.current = true;
      if (!localStorage.getItem('matrixtoken')) {
        const parsed = qs.parse(window.location.search, { ignoreQueryPrefix: true });
        const { loginToken } = parsed;
        if (!loginToken) {
          window.location.href = `https://yourDomain.com/_matrix/client/r0/login/sso/redirect?redirectUrl=${
            encodeURIComponent(window.location.href)}`;
        } else {
          localStorage.setItem('matrixtoken', loginToken);
          initializeMatrixClient(loginToken);
        }
      } else {
        initializeMatrixClient(localStorage.getItem('matrixtoken'));
      }
    } else if (initialized && !keycloak.authenticated && state.initialized) {
      localStorage.removeItem('matrixtoken');
      initializing.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, keycloak, loading]);

  if (!state.initialized && userData) return 'Lädt';

  return (
    <>
      <MatrixContext.Provider
        value={state}
      >
        {children}
      </MatrixContext.Provider>
    </>
  );
};

MatrixProvider.propTypes = {
  children: PropTypes.node,
};

MatrixProvider.defaultProps = {
  children: <div />,
};

export default MatrixProvider;
