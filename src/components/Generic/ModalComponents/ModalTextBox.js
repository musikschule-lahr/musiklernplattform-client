/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'musiklernplattform-components';

const ModalTextBox = ({
  onInputChange,
  isMultipleLine, label,
  isDisabled, value, ...rest
}) => {
  const [inputValue, setInputValue] = useState(value);

  const inputChangeHandler = (newvalue) => {
    setInputValue(newvalue);
    onInputChange(newvalue);
  };

  const inputClearHandler = () => {
    setInputValue('');
    onInputChange('');
  };
  return (
    <label>
      <div className="margin-y">{label}</div>
      <Input
        value={inputValue}
        clearButton
        onChangeHandler={inputChangeHandler}
        onClearHandler={inputClearHandler}
        className="w-100"
        inputStyle={{ width: '100%' }}
        disabled={isDisabled}
        {...rest}
      />
    </label>
  );
};

ModalTextBox.propTypes = {
  isDisabled: PropTypes.bool,
  isMultipleLine: PropTypes.bool,
  onInputChange: PropTypes.func.isRequired,
};
ModalTextBox.defaultProps = {
  isDisabled: false,
  isMultipleLine: false,
};
export default ModalTextBox;
