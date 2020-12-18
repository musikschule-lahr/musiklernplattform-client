import React, { useEffect, useState } from 'react';
import {
  Dialog,
  TextButton,
  DialogNormalHeader,
  DialogNormalBody,
} from 'musiklernplattform-components';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const InfoList = styled.ul`
  text-transform: uppercase;
  list-style-type: none;
  margin: 0;
`;
const InfoListItem = styled.li`
  display:inline-flex;
  width:100%;
  margin-left:-36px;
  div {
    width:50%;
  }
  div:first-child{
    color: rgba(235,235,245,0.6);
  }
  div:nth-child(2){
    font-weight: bold;
  }
`;

const InfoModal = ({
  onClose, metaData,
}) => {
  const [metaDataList, setMetaDataList] = useState([]);
  useEffect(() => {
    const list = [
      ...metaData,
      { name: 'Lorem', value: 'Max Mustermann', customStyle: { paddingTop: '1rem' } },
      { name: 'Ipsum', value: 'Maria Mustermann' },
    ];
    setMetaDataList(list);
  }, []);
  return (
    <Dialog onClose={onClose}>
      <DialogNormalHeader className="">
        <h4 style={{ marginLeft: 0, marginRight: 'auto' }}>Credits</h4>
        <TextButton
          className="centered"
          onClickHandler={onClose}
          title="Fertig"
        />
      </DialogNormalHeader>
      <DialogNormalBody style={{ padding: '1rem' }}>
        <InfoList>
          {metaDataList.map((data, key) => (
            // eslint-disable-next-line react/no-array-index-key
            <InfoListItem style={data.customStyle} key={`info-item_${key}`}>
              <div>{data.name}</div>
              <div>{data.value}</div>
            </InfoListItem>
          ))}
          <br />
        </InfoList>

      </DialogNormalBody>
    </Dialog>
  );
};

InfoModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  metaData: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired, value: PropTypes.string.isRequired,
  })),
};

InfoModal.defaultProps = {
  metaData: [],
};

export default InfoModal;
