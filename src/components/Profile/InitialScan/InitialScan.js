import React, {} from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'musiklernplattform-components';

const InitialScan = () => {
  const history = useHistory();

  const goQr = () => {
    history.push('/qr');
  };

  return (
    <>
      <h2>Es sind keine Verbindungen vorhanden!</h2>
      <p>
        Um diese Anwendung vollständig nutzen zu können, musst du eine Verbindung haben.
        <br />
        Durch Scan eines QR-Codes deiner Musikschule / einer Lehrkraft oder Schüler*innen wirst du eine Verbindung erhalten.
      </p>
      <Button
        onClickHandler={goQr}
        title="Verbindung hinzufügen"
      />
    </>
  );
};
export default InitialScan;
