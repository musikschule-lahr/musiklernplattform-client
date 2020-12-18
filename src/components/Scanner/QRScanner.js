/* eslint-disable max-len */
/* eslint-disable no-use-before-define */

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import {
  useHistory,
} from 'react-router-dom';
import ScannerInfo from './ScannerInfo';
import InfoModal from '~/components/Generic/AlertModal';
import {
  GET_USER_BY_ID, GET_INSTRUMENT_FROM_ID,
  GET_USER, GET_SCHOOL_BY_USER_ID,
} from '~/constants/gql/user';
import {
  GET_GROUP,
} from '~/constants/gql/group';
import {
  GET_TEACHERS, ADD_TEACHER_LESSON, ADD_TEACHER_GROUP,
  ADD_CHILD,
  ADD_OFFICE,
  GET_CHILDREN,
  GET_SINGLE_CHILD,
  GET_SINGLE_TEACHER_LESSON,
  GET_SINGLE_TEACHER_GROUP,
  GET_SINGLE_OFFICE,
} from '~/constants/gql/relations';
import { QR, plans } from '~/constants/util';
import { useImperativeQuery, usePlans } from '~/constants/hooks';

/*
  TODO: Bislang ist der QR Code klar lesbar, es muss noch ein Secret dazu,
  & das Ganze sollte verschlüsselt werden (zB base64)

  Weitere Möglichkeiten zur Sicherheit: valid till, entweder Zeitbasiert oder
  von Lehrerseite: Counter für ein Fach (Neuer Code generieren inkrementiert)
  > Client muss abfragen ob der Code jeweils valide is
*/
const QRScanner = () => {
  const history = useHistory();

  const { loading: loadingPlans, comparePlans, updatePlans } = usePlans();

  const [dialog, setDialog] = useState((<div />));
  const [infoBodyMsg, setInfoBodyMsg] = useState('');
  const [infoHeaderMsg, setInfoHeaderMsg] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showResultInfo, setShowResultInfo] = useState(false);

  const loadUser = useImperativeQuery(GET_USER_BY_ID);
  const loadSchool = useImperativeQuery(GET_SCHOOL_BY_USER_ID);
  const loadInstrument = useImperativeQuery(GET_INSTRUMENT_FROM_ID);
  const loadGroup = useImperativeQuery(GET_GROUP);
  const loadSingleChild = useImperativeQuery(GET_SINGLE_CHILD);
  const loadSingleOffice = useImperativeQuery(GET_SINGLE_OFFICE);
  const loadSingleTeacherLesson = useImperativeQuery(GET_SINGLE_TEACHER_LESSON);
  const loadSingleTeacherGroup = useImperativeQuery(GET_SINGLE_TEACHER_GROUP);

  const [addLesson] = useMutation(
    ADD_TEACHER_LESSON, {
      errorPolicy: 'all',
      update: () => {
        updatePlans();
        setShowResultInfo(true);
      },
      onError: (() => {
        setInfoBodyMsg('Bitte versuche es erneut!');
        setInfoHeaderMsg('Es gab einen Fehler...');
        setShowResultInfo(true);
      }),
      refetchQueries: [
        { query: GET_TEACHERS },
        { query: GET_USER },
      ],
    },
  );

  const [addGroup] = useMutation(
    ADD_TEACHER_GROUP, {
      errorPolicy: 'all',
      update: () => {
        updatePlans();
        setShowResultInfo(true);
      },
      onError: (() => {
        setInfoBodyMsg('Bitte versuche es erneut!');
        setInfoHeaderMsg('Es gab einen Fehler...');
        setShowResultInfo(true);
      }),
      refetchQueries: [
        { query: GET_TEACHERS },
        { query: GET_USER },
      ],
    },
  );

  const [addChild] = useMutation(
    ADD_CHILD, {
      errorPolicy: 'all',
      update: () => {
        updatePlans();
        setShowResultInfo(true);
      },
      onError: (() => {
        setInfoBodyMsg('Bitte versuche es erneut!');
        setInfoHeaderMsg('Es gab einen Fehler...');
        setShowResultInfo(true);
      }),
      refetchQueries: [
        { query: GET_CHILDREN },
        { query: GET_USER },
      ],
    },
  );
  const [addOffice] = useMutation(
    ADD_OFFICE, {
      errorPolicy: 'all',
      update: () => {
        updatePlans();
        setShowResultInfo(true);
      },
      onError: (() => {
        setInfoBodyMsg('Bitte versuche es erneut!');
        setInfoHeaderMsg('Es gab einen Fehler...');
        setShowResultInfo(true);
      }),
      refetchQueries: [
        { query: GET_CHILDREN },
        { query: GET_USER },
      ],
    },
  );
  const closeInfo = () => {
    setShowInfo(false);
    window.QRScanner.scan(displayContents);
  };

  async function displayContents(err, text) {
    if (err) {
      if (err.name === 'CAMERA_ACCESS_DENIED') {
        setInfoBodyMsg(
          <div>
            Der Kamerazugriff muss erlaubt werden, um QR-Codes zu scannen.
            <br />
            Bitte gehe in die Einstellungen und erlaube die Verwendung der Kamera.
          </div>,
        );
        setInfoHeaderMsg('Es gab einen Fehler...');
        setShowResultInfo(true);
      } else window.QRScanner.scan(displayContents);
    } else {
      // The scan completed, display the contents of the QR code:
      const params = (text.result ? text.result.split(QR.DELIMITER) : text.split(QR.DELIMITER));
      if (params.length < 2) {
        window.QRScanner.scan(displayContents);
      } else {
        switch (parseInt(params[1], 10)) {
          case QR.TEACHER_LESSON: {
            if (params.length !== 3) break;
            if (!comparePlans([plans.NONE, plans.STUDENT])) {
              setInfoBodyMsg(
                <div>
                  Du musst Schüler sein um einen Lehrer hinzuzufügen.
                </div>,
              );
              setInfoHeaderMsg('Es gab einen Fehler...');
              setShowResultInfo(true);
              break;
            }
            const user = await loadUser({ userId: parseInt(params[0], 10) });
            const instrument = await loadInstrument({ instrumentId: parseInt(params[2], 10) });
            const userName = `${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname}`;
            setDialog(<ScannerInfo
              name={userName}
              // eslint-disable-next-line jsx-a11y/aria-role
              roleName="Lehrkraft"
              lessonName={instrument.data.getInstrumentFromId.name}
              onSubmit={async () => {
                setShowInfo(false);
                const relation = await loadSingleTeacherLesson(
                  {
                    userId: parseInt(params[0], 10),
                    instrumentId: parseInt(params[2], 10),
                  },
                );
                if (relation.data.getSingleTeacherFromLesson != null) {
                  setInfoHeaderMsg('Info');
                  let infoTxt = `Du bist bereits mit
                  ${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname} verbunden.`;
                  if (!relation.data.getSingleTeacherFromLesson.isConfirmed) {
                    infoTxt += '\nDie Bestätigung der Lehrkraft steht noch aus.';
                  }
                  setInfoBodyMsg(infoTxt);
                  setShowResultInfo(true);
                } else {
                  setInfoHeaderMsg('Hurra!');
                  setInfoBodyMsg(`Deine Anfrage wurde erfolgreich an
                  ${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname} gesendet. \nDie Verbindung mit deiner Lehrkraft wird nach seiner Bestätigung aktiv.`);
                  addLesson({
                    variables: {
                      user: { id: parseInt(params[0], 10) },
                      instrument: { id: parseInt(params[2], 10) },
                    },
                  });
                }
              }}
              onClose={() => closeInfo()}
            />);
            setShowInfo(true);
            break;
          }
          case QR.TEACHER_GROUP: {
            if (params.length !== 3) break;
            if (!comparePlans([plans.NONE, plans.STUDENT])) {
              setInfoBodyMsg(
                <div>
                  Du musst Schüler sein um einen Lehrer hinzuzufügen.
                </div>,
              );
              setInfoHeaderMsg('Es gab einen Fehler...');
              setShowResultInfo(true);
              break;
            }
            const user = await loadUser({ userId: parseInt(params[0], 10) });
            const group = await loadGroup({ groupId: parseInt(params[2], 10) });
            const userName = `${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname}`;
            setDialog(<ScannerInfo
              name={userName}
              // eslint-disable-next-line jsx-a11y/aria-role
              roleName="Lehrkraft"
              groupName={group.data.getGroup.name}
              onSubmit={async () => {
                setShowInfo(false);

                const relation = await loadSingleTeacherGroup(
                  {
                    userId: parseInt(params[0], 10),
                    groupId: parseInt(params[2], 10),
                  },
                );
                if (relation.data.getSingleTeacherFromGroup != null) {
                  setInfoHeaderMsg('Info');
                  let infoTxt = `Du bist bereits mit
                    ${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname} verbunden.`;
                  if (!relation.data.getSingleTeacherFromGroup.isConfirmed) {
                    infoTxt += '\nDie Bestätigung der Lehrkraft steht noch aus.';
                  }
                  setInfoBodyMsg(infoTxt);
                  setShowResultInfo(true);
                } else {
                  setInfoHeaderMsg('Hurra!');
                  setInfoBodyMsg(`Deine Anfrage wurde erfolgreich an
                  ${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname} gesendet. \nDie Verbindung mit deiner Lehrkraft wird nach seiner Bestätigung aktiv.`);
                  addGroup({
                    variables: {
                      user: { id: parseInt(params[0], 10) },
                      group: { id: parseInt(params[2], 10) },
                    },
                  });
                }
              }}
              onClose={() => closeInfo()}
            />);
            setShowInfo(true);
            break;
          }
          case QR.PARENT: {
            if (!comparePlans([plans.NONE, plans.PARENT])) {
              setInfoBodyMsg(
                <div>
                  Du musst bereits mit einem Schüler-Familienmitglied verbunden sein, um ein weiteres Schüler-Familienmitglied hinzuzufügen.
                </div>,
              );
              setInfoHeaderMsg('Es gab einen Fehler...');
              setShowResultInfo(true);
              break;
            }
            const user = await loadUser({ userId: parseInt(params[0], 10) });
            const userName = `${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname}`;
            setDialog(<ScannerInfo
              name={userName}
              // eslint-disable-next-line jsx-a11y/aria-role
              roleName="Familienmitglied"
              onSubmit={async () => {
                setShowInfo(false);
                const relation = await loadSingleChild({ userId: parseInt(params[0], 10) });
                if (relation.data.getSingleChild != null) {
                  setInfoHeaderMsg('Info');
                  let infoTxt = `Du bist bereits mit
                    ${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname} verbunden.`;
                  if (!relation.data.getSingleChild.isConfirmed) {
                    infoTxt += '\nDie Bestätigung des Schüler-Familienmitglieds steht noch aus.';
                  }
                  setInfoBodyMsg(infoTxt);
                  setShowResultInfo(true);
                } else {
                  setInfoHeaderMsg('Hurra!');
                  setInfoBodyMsg(`Deine Anfrage wurde erfolgreich an
                    ${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname} gesendet.`);
                  addChild({
                    variables: {
                      user: { id: parseInt(params[0], 10) },
                    },
                  });
                }
              }}
              onClose={() => closeInfo()}
            />);
            setShowInfo(true);
            break;
          }
          // Möchtest du dich mit Musikschule XXX verbinden?
          case QR.OFFICE: {
            if (!comparePlans([plans.NONE])) {
              setInfoBodyMsg(
                <div>
                  Du darfst noch keine Rolle innehaben und keiner Musikschule zugeordnet sein, um dich als Lehrer zu registrieren..
                </div>,
              );
              setInfoHeaderMsg('Es gab einen Fehler...');
              setShowResultInfo(true);
              break;
            }
            let school = null;
            try {
              school = await loadSchool({ userId: parseInt(params[0], 10) });
            } catch (e) {
              setInfoBodyMsg(
                <div>
                  Der Code ist ungültig.
                </div>,
              );
              setInfoHeaderMsg('Es gab einen Fehler...');
              setShowResultInfo(true);
              break;
            }
            //  const sc = `${user.data.getUserFromId.firstname} ${user.data.getUserFromId.lastname}`;
            setDialog(<ScannerInfo
              name={school.data.getSchoolByUserId.name}
              // eslint-disable-next-line jsx-a11y/aria-role
              roleName="zugeordneter Lehrer"
              onSubmit={async () => {
                setShowInfo(false);
                const relation = await loadSingleOffice({ userId: parseInt(params[0], 10) });
                if (relation.data.getSingleOffice != null) {
                  setInfoHeaderMsg('Info');
                  const infoTxt = `Du bist bereits mit der ${school.data.getSchoolByUserId.name} verbunden.`;
                  setInfoBodyMsg(infoTxt);
                  setShowResultInfo(true);
                } else {
                  setInfoHeaderMsg('Hurra!');
                  setInfoBodyMsg(`Du hast dich erfolgreich als Lehrkraft der ${school.data.getSchoolByUserId.name} angemeldet.`);
                  addOffice({
                    variables: {
                      user: { id: parseInt(params[0], 10) },
                    },
                  });
                }
              }}
              onClose={() => closeInfo()}
            />);
            setShowInfo(true);
            break;
            break;
          }
          default: {
            window.QRScanner.scan(displayContents);
          }
        }
      }
    }
  }

  useEffect(() => {
    document.querySelector('#app').style.backgroundColor = 'transparent';
    window.QRScanner.prepare(() => {
      window.QRScanner.show(() => {
        window.QRScanner.scan(displayContents);
      });
    });
    /*
    const interval = setInterval(() => {
      window.QRScanner.getStatus((current) => {
        console.log(current.prepared);
        console.log(current.scanning);
        setStatus(current);
      });
    }, 15000); */

    // window.QRScanner.scan(displayContents);
    return () => {
      //   clearInterval(interval);
      window.QRScanner.destroy(() => {
        document.querySelector('#app').style.backgroundColor = 'rgba(37,37,37,1)';
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeInfoModal = () => {
    setShowResultInfo(false);
    history.goBack();
  };

  return (
    <div style={{ }}>
      {showResultInfo
      && (
      <InfoModal
        headerMsg={infoHeaderMsg}
        bodyMsg={infoBodyMsg}
        onClose={closeInfoModal}
      />
      )}
      {showInfo && (
        dialog
      )}
    </div>
  );
};

export default QRScanner;
