import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'musiklernplattform-components';

const NotFound = ({ tryAgainFunc }) => (
  <div className="not-found">
    <h2>Error</h2>
    <div>
      Es konnte keine Verbindung zum Server hergestellt werden...
      <br />
      <Button
        title="Nochmal versuchen"
        name="refreshBtn"
        type="submit"
        onClickHandler={tryAgainFunc}
      />
    </div>
  </div>
);

NotFound.propTypes = {
  tryAgainFunc: PropTypes.func.isRequired,
};

export default NotFound;
