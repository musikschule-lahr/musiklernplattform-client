import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useParams, useHistory } from 'react-router-dom';
import { useQuery, useApolloClient, gql } from '@apollo/client';
import EllipsisCircleIcon from '@iconify/icons-ion/ellipsis-horizontal-circle';
import { TonePlayer } from 'musiklernplattform-lib-components';
import { generateActionItem, libItemOptionsConstants, getFilePath } from '~/constants/util';
import { GET_LIB_ELEMENT_FROM_PATH } from '~/constants/gql/lib';
import OptionsModal from './OptionsModal';
import LibItemOptionsModal from './LibItemOptionsModal';
import InfoModal from './InfoModal';
import AlertModal from '~/components/Generic/AlertModal';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';
import {
  GET_BOARD,
  GET_BOARD_BY_ID,
  GET_GROUP_BOARD_BY_ID,
  ADD_GROUP_CARD,
  ADD_USER_CARD,
} from '~/constants/gql/board';

const PlayerWrapper = ({ setActionItems, setHeading }) => {
  const client = useApolloClient();
  const history = useHistory();

  const { path } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlayable, setPlayable] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [alertBodyMsg, setAlertBodyMsg] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const alertCloseFunction = useRef();

  const { permissions } = window.cordova.plugins;
  const playerTypes = {
    KORREPETITION: 0,
    ENSEMBLE_BAND: 1,
    SOLO: 2,
  };
  const { data, loading } = useQuery(GET_LIB_ELEMENT_FROM_PATH,
    {
      variables: { path: `${path}` },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        let heading = '';
        if (data.getLibElementFromPath.playerType === 'Ensemble_Band') {
          if (data.getLibElementFromPath.metaData.interpreter) {
            heading = `${data.getLibElementFromPath.metaData.interpreter.name} - `;
          }
        }
        if (data.getLibElementFromPath.playerType === 'Korrepetition') {
          heading = `${data.getLibElementFromPath.metaData.composer.firstname} ${
            data.getLibElementFromPath.metaData.composer.lastname} - `;
        }
        setHeading(`${heading} ${data.getLibElementFromPath.metaData.shortTitle}`);
        const trackList = [];
        const spurNamen = [];
        let videoSource;
        let spurCounter = 1;
        data.getLibElementFromPath.tracks.forEach((track) => {
          if (!track.filePath) return;
          if (!track.isVideo) {
            trackList.push(getFilePath(track.filePath, data.getLibElementFromPath));
            spurNamen.push(track.title || `Spur ${spurCounter}`);
            spurCounter += 1;
          } else videoSource = getFilePath(track.filePath, data.getLibElementFromPath);
        });
        const playerType = playerTypes[data.getLibElementFromPath.playerType.toUpperCase()];
        const coverPath = data.getLibElementFromPath.metaData.coverImagePath ? getFilePath(
          data.getLibElementFromPath.metaData.coverImagePath, data.getLibElementFromPath,
        ) : '/img/logo.png';
        //      console.log('trackList', trackList);
        setSelected({
          trackList,
          videoSource,
          spurNamen,
          playerType,
          coverPath,
          hertzBase: data.getLibElementFromPath.metaData.tuning,
        });
      },
    });
  useEffect(() => {
    if (data) {
      setActionItems(
        generateActionItem(EllipsisCircleIcon, true, /* 'Gruppenverwaltung' */ null, () => setShowOptionsModal(true)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    if (data) {
      setIsFavorite(data.getLibElementFromPath.isFavorite);
      setActionItems(
        generateActionItem(EllipsisCircleIcon, true, /* 'Gruppenverwaltung' */ null,
          () => setShowOptionsModal(true)),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    window.screen.orientation.lock('portrait');
    // allow user rotate
    return (() => window.screen.orientation.unlock());
  }, []);

  useEffect(() => {
    if (permissions) {
      const execPermissionPromise = (permissionName) => new Promise((resolve, reject) => {
        permissions.checkPermission(permissionName, (status) => {
          if (!status.hasPermission) {
            permissions.requestPermission(permissionName, () => {
              resolve();
            }, () => { reject(); });
          } else {
            resolve();
          }
        });
      });

      execPermissionPromise(permissions.RECORD_AUDIO).then(() => {
        execPermissionPromise(permissions.WRITE_EXTERNAL_STORAGE).then(() => {
          execPermissionPromise(permissions.MODIFY_AUDIO_SETTINGS).then(() => {
            setPlayable(true);
          });
        });
      }).catch((err) => {
        setAlertBodyMsg('Die Berechtigungen sind benötigt, um Audio abspielen + aufnehmen zu können.');
        alertCloseFunction.current = () => history.back();
        setShowAlert(true);
      });
    } else {
      setPlayable(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

  const closeOptionsModal = () => {
    setShowOptionsModal(false);
  };
  const submitOptionsModal = (pickedOptionsItem) => {
    setShowOptionsModal(false);
    switch (pickedOptionsItem) {
      case libItemOptionsConstants.ADD_FAVORITE: {
        client.writeFragment({
          id: `LibElement:{"idLibElement":${data.getLibElementFromPath.idLibElement}}`,
          fragment: gql`
            fragment libElementFavorite on LibElement {
              isFavorite
            }
          `,
          data: {
            isFavorite: true,
          },
        });
        setIsFavorite(true);
        break;
      }
      case libItemOptionsConstants.REMOVE_FAVORITE: {
        client.writeFragment({
          id: `LibElement:{"idLibElement":${data.getLibElementFromPath.idLibElement}}`,
          fragment: gql`
            fragment libElementFavorite on LibElement {
              isFavorite
            }
          `,
          data: {
            isFavorite: false,
          },
        });
        setIsFavorite(false);
        break;
      }
      case libItemOptionsConstants.DOWNLOAD: {
        break;
      }
      case libItemOptionsConstants.REMOVE_DOWNLOAD: {
        break;
      }
      case libItemOptionsConstants.SHARE_MSG: {
        setSelectedOption({
          heading: 'Teilen als Nachricht',
          submitBtnText: 'Absenden',
          libItemOption: pickedOptionsItem,
          libItem: data.getLibElementFromPath,
        });
        break;
      }
      case libItemOptionsConstants.CREATE_TODO: {
        setSelectedOption({
          heading: 'TO DO erstellen',
          submitBtnText: 'Karte erstellen',
          libItemOption: pickedOptionsItem,
          libItem: data.getLibElementFromPath,
        });
        break;
      }
      case libItemOptionsConstants.ADD_COLLECTION: {
        setSelectedOption({
          heading: 'Meine Sammlung hinzufügen',
          submitBtnText: 'Hinzufügen',
          libItemOption: pickedOptionsItem,
          libItem: data.getLibElementFromPath,
        });
        break;
      }
      case libItemOptionsConstants.OPEN_INFO: {
        setShowInfoModal(true);
        break;
      }
      case libItemOptionsConstants.OPEN_HELP: {
        break;
      }
      default: {
        // ...
      }
    }
  };

  const closeLibItemsOptionsModal = () => {
    setSelectedOption(null);
  };
  const closeInfoModal = () => {
    setShowInfoModal(false);
  };
  const submitLibItemsOptionsModal = (pickedOptionsItem, values) => {
    switch (pickedOptionsItem) {
      case libItemOptionsConstants.SHARE_MSG: {
        break;
      }
      case libItemOptionsConstants.CREATE_TODO: {
        const { receiver, description } = values;
        if (description < 2) {
          setAlertBodyMsg('Die Beschreibung muss länger als zwei Zeichen sein.');
          alertCloseFunction.current = () => {};
          setShowAlert(true);
        } else {
          switch (receiver.type) {
            case 'me': {
              client.query({
                query: GET_BOARD,
              }).then((board) => {
                const variables = {
                  laneid: board.data.getMyUserBoard.lanes[0].idLane,
                  cardlanesorting: (board.data.getMyUserBoard.lanes[0].cards.length + 1) * 100,
                  description,
                  libElement: { id: data.getLibElementFromPath.idLibElement },
                };
                client.mutate({
                  mutation: ADD_USER_CARD,
                  variables,
                }).then(() => {
                  setAlertBodyMsg('Dein To Do wurde erstellt!');
                  alertCloseFunction.current = () => {};
                  setShowAlert(true);
                });
              });

              break;
            }
            case 'user': {
              client.query({
                query: GET_BOARD_BY_ID,
                variables: { userid: parseInt(receiver.id, 10) },
              }).then((board) => {
                const variables = {
                  laneid: board.data.getUserBoardFromUser.lanes[0].idLane,
                  cardlanesorting: (board.data.getUserBoardFromUser.lanes[0].cards.length + 1) * 100,
                  description,
                  libElement: { id: data.getLibElementFromPath.idLibElement },
                };
                client.mutate({
                  mutation: ADD_USER_CARD,
                  variables,
                }).then(() => {
                  setAlertBodyMsg('Dein To Do wurde erstellt!');
                  alertCloseFunction.current = () => {};
                  setShowAlert(true);
                });
              });
              break;
            }
            case 'group': {
              client.query({
                query: GET_GROUP_BOARD_BY_ID,
                variables: { groupid: parseInt(receiver.id, 10) },
              }).then((board) => {
                const variables = {
                  laneid: board.data.getGroupBoard.lanes[0].idLane,
                  cardlanesorting: (board.data.getGroupBoard.lanes[0].cards.length + 1) * 100,
                  description,
                  libElement: { id: data.getLibElementFromPath.idLibElement },
                  groupid: parseInt(receiver.id, 10),
                };
                client.mutate({
                  mutation: ADD_GROUP_CARD,
                  variables,
                }).then(() => {
                  setAlertBodyMsg('Dein To Do wurde erstellt!');
                  alertCloseFunction.current = () => {};
                  setShowAlert(true);
                });
              });

              break;
            }
            default: {
            // ...
            }
          }
        }
        break;
      }
      case libItemOptionsConstants.ADD_COLLECTION: {
        const { description } = values;
        if (description.length < 2) {
          setAlertBodyMsg('Die Beschreibung muss länger als zwei Zeichen sein.');
          alertCloseFunction.current = () => {};
          setShowAlert(true);
        } else {
          client.query({
            query: GET_BOARD,
          }).then((board) => {
            const collectionIdx = board.data.getMyUserBoard.lanes.findIndex(
              (lane) => (lane.title === 'Meine Sammlung'),
            );
            const variables = {
              laneid: board.data.getMyUserBoard.lanes[collectionIdx].idLane,
              cardlanesorting: (board.data.getMyUserBoard.lanes[collectionIdx].cards.length + 1) * 100,
              description,
              libElement: { id: data.getLibElementFromPath.idLibElement },
            };
            client.mutate({
              mutation: ADD_USER_CARD,
              variables,
            }).then(() => {
              setAlertBodyMsg('Dein To Do wurde erstellt!');
              alertCloseFunction.current = () => {};
              setShowAlert(true);
            });
          });
        }
        break;
      }
      default: {
        //
      }
    }
    setSelectedOption(null);
  };
  if (!isPlayable || !selected) return <LoadingIndicator paddingX={18} />;

  return (
    <div className="player">
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar {
          display: none !important;
        }
        .content{
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }`,
      }}
      />
      {showAlert
       && (
       <AlertModal
         onClose={() => {
           setAlertBodyMsg('');
           setShowAlert(false);
           alertCloseFunction.current();
           alertCloseFunction.current = () => {};
         }}
         headerMsg="Info"
         bodyMsg={alertBodyMsg}
       />
       )}
      {showOptionsModal
       && (
       <OptionsModal
         onClose={closeOptionsModal}
         onSubmit={submitOptionsModal}
         isFavorite={isFavorite}
       />
       )}
      {showInfoModal
       && (
       <InfoModal
         onClose={closeInfoModal}
         metaData={[{ name: 'Lorem Ipsum', value: 'Dola Sid' }]}
       />
       )}
      {selectedOption
       && (
       <LibItemOptionsModal
         onClose={closeLibItemsOptionsModal}
         onSubmit={submitLibItemsOptionsModal}
         heading={selectedOption.heading}
         submitBtnText={selectedOption.submitBtnText}
         libItemOption={selectedOption.libItemOption}
         libItem={selectedOption.libItem}
       />
       )}
      <TonePlayer
        trackList={selected.trackList}
        playerType={selected.playerType}
        spurNamen={selected.spurNamen}
        videoSource={selected.videoSource}
        coverPath={selected.coverPath}
        hertzBase={selected.hertzBase}
      />
    </div>
  );
};

PlayerWrapper.propTypes = {
  setActionItems: PropTypes.func,
  setHeading: PropTypes.func.isRequired,
};

PlayerWrapper.defaultProps = {
  setActionItems: null,
};
export default PlayerWrapper;
