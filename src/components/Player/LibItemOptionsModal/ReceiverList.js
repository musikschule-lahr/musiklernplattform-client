// Temporary, as base for later implementations with overlay!
import React, {
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  MultiSelectList,
} from 'musiklernplattform-components';
import { useSortedUserGroupList } from '~/constants/hooks';
import LoadingIndicator from '~/components/Generic/LoadingIndicator';

const ReceiverList = ({ onReceiverSelected, addMe }) => {
  const { loading, contacts } = useSortedUserGroupList();

  const [contactList, setContactList] = useState('');

  useEffect(() => {
    if (!contactList && contacts) {
      const list = [...contacts];
      if (addMe) {
        list.unshift({
          type: 'me',
          value: 'Mein Board',
        });
      }
      setContactList(list);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactList, loading]);

  function onSelectionChangeHandler(option) {
    setContactList(contactList.map((contact) => ({
      ...contact,
      selected: contact.key === option.key && contact.value === option.value,
    })));
    onReceiverSelected({ id: option.key, type: option.type });
  }

  if (!contactList) return <LoadingIndicator />;

  return (
    <MultiSelectList options={contactList} onChangeHandler={onSelectionChangeHandler} />
  );
};

ReceiverList.propTypes = {
  onReceiverSelected: PropTypes.func.isRequired,
  addMe: PropTypes.bool,
};
ReceiverList.defaultProps = {
  addMe: false,
};
export default ReceiverList;
