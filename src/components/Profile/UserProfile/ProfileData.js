import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { DataSheet, DataRow } from 'musiklernplattform-components';

const ProfileData = ({
  firstname, lastname, mail, phone, school, username, birthyear, instruments,
}) => (
  <DataSheet width="auto">
    <DataRow label="Vorname" value={firstname} />
    <DataRow label="Nachname" value={lastname} />
    <DataRow label="E-Mail" value={mail} />
    <DataRow label="Telefon" value={phone} />
    {/* <DataRow label="Musikschule" value={school} /> */}
    <DataRow label="Benutzername" value={username} />
    <DataRow
      label="Geburtsjahr"
      value={birthyear}
    />
    <DataRow
      label="Instrumente"
      value={
           ((instruments || []).length > 0)
             ? instruments.map(
               (instrument, index) => (
                 (index > 0 ? ' ' : '') + instrument.name
               ),
             ).toString()
             : 'Keine Instrumente'
     }
    />
  </DataSheet>
);

ProfileData.propTypes = {
  firstname: PropTypes.string,
  lastname: PropTypes.string,
  mail: PropTypes.string,
  phone: PropTypes.string,
  school: PropTypes.string,
  username: PropTypes.string,
  birthyear: PropTypes.number,
  instruments: PropTypes.arrayOf(PropTypes.object),
};
ProfileData.defaultProps = {
  firstname: 'Keine Angabe',
  lastname: 'Keine Angabe',
  mail: 'Keine Angabe',
  phone: 'Keine Angabe',
  school: 'Musikschule Lahr',
  username: 'Keine Angabe',
  birthyear: null,
  instruments: [],
};

export default ProfileData;
