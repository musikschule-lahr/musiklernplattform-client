import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'musiklernplattform-components';

const LibItemTextBox = ({ onInputChange, isMultipleLine }) => {
  const [inputValue, setInputValue] = useState('');

  const inputChangeHandler = (newvalue) => {
    setInputValue(newvalue);
    onInputChange(newvalue);
  };

  const inputClearHandler = () => {
    setInputValue('');
    onInputChange('');
  };
  return (
    <Input
      value={inputValue}
      clearButton
      name="SubjectInput"
      id="SubjectInput"
      onChangeHandler={inputChangeHandler}
      onClearHandler={inputClearHandler}
      className="w-100"
      inputStyle={{ width: '100%' }}
    />
  );
};

LibItemTextBox.propTypes = {
  isMultipleLine: PropTypes.bool,
  onInputChange: PropTypes.func.isRequired,
};
LibItemTextBox.defaultProps = {
  isMultipleLine: false,
};
export default LibItemTextBox;
