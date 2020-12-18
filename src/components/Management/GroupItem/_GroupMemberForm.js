import React, {
  useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  TextButton,
  MultiSelectList,
} from 'musiklernplattform-components';
import {
  useQuery,
} from '@apollo/client';
import { GET_CONFIRMED_STUDENTS } from '~/constants/gql/relations';

const GroupMemberForm = ({ onSubmit, onClose, groupMembers }) => {
  const [allUsers, setAllUsers] = useState(null);

  const {
    loading, data,
  } = useQuery(GET_CONFIRMED_STUDENTS, {
    errorPolicy: 'all',
  });
  console.log(data);
  const submitForm = function () {
    const addchanges = [];
    allUsers.forEach((value) => {
      console.log(value);
      if (value.isMember) {
        if (value.isMember) addchanges.push({ id: allUsers[value.index].id });
      }
    });
    onSubmit(addchanges, []);
  };
  const closeForm = function () {
    onClose();
  };

  useEffect(() => {
    if (!allUsers && data && !loading) {
      const students = [];
      const groupMembersCopy = [...groupMembers];
      let index = 0;
      data.getMyConfirmedStudents.forEach((student) => {
        const newuser = {
          name: `${student.name}`,
          id: student.id,
          isMember: false,
          key: student.id,
        };
        const isMember = groupMembersCopy.findIndex((user) => user.id === student.id);
        if (isMember >= 0) {
          groupMembersCopy.splice(isMember, 1);
          newuser.isMember = true;
        } else {
          newuser.index = index++;
          students.push(newuser);
        }
      });
      setAllUsers(students);
    }
  }, [allUsers, data, groupMembers, loading]);

  function handleAllUserChange(option) {
    const newAllUsers = [...allUsers];
    newAllUsers[option.key].isMember = !newAllUsers[option.key].isMember;
    setAllUsers(newAllUsers);
  }
  if (!allUsers || loading) return <LoadingIndicator />;
  return (
    <Dialog className="teacher-class-form-dialog" onClose={() => closeForm()}>
      <DialogHeader>
        <h4>Teilnehmerliste bearbeiten</h4>
        <TextButton title="Fertig" onClickHandler={() => submitForm()} />
      </DialogHeader>
      <DialogBody>
        <form>
          <MultiSelectList
            options={allUsers.map((user) => ({
              key: user.index,
              value: user.name,
              selected: user.isMember,
            }))}
            onChangeHandler={handleAllUserChange}
          />
          {allUsers.length < 1 && 'Es gibt keine verbundenen Nutzer, die dieser Gruppe nicht zugewiesen sind.'}
        </form>
      </DialogBody>
    </Dialog>

  );
};

export default GroupMemberForm;
