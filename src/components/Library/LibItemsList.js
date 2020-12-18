import React from 'react';
import {
  LibraryHorizontalList, LibraryItem, TextButton, Row, Col,
} from 'musiklernplattform-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getFilePath } from '~/constants/util';

const ListHeadingComponent = ({ heading, getMoreBtnData }) => {
  const renderGetMoreBtn = () => {
    if (getMoreBtnData.link) {
      return (
        <Link
          style={{ margin: '0 9px 9px auto', alignSelf: 'flex-end', textDecoration: 'none' }}
          to={getMoreBtnData.link}
        >
          <TextButton
            className="padding-0"
            title={getMoreBtnData.title}
            onClickHandler={getMoreBtnData.function || (() => {})}
          />
        </Link>
      );
    }
    return (
      <div
        style={{ margin: '0 9px 9px auto', alignSelf: 'flex-end', textDecoration: 'none' }}
      >
        <TextButton
          className="padding-0"
          title={getMoreBtnData.title}
          onClickHandler={getMoreBtnData.function || (() => {})}
        />
      </div>
    );
  };
  return (
    <div
      style={{
        marginRight: -18,
        height: 62,
        minHeight: 62,
        borderBottom: '1px solid #565656',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <h2 style={{ marginBottom: 8, marginTop: 18 + 8 }}>{heading}</h2>
      {getMoreBtnData && renderGetMoreBtn()}
    </div>
  );
};
ListHeadingComponent.propTypes = {
  heading: PropTypes.string,
  getMoreBtnData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    link: PropTypes.string,
    function: PropTypes.func,
  }),
};
ListHeadingComponent.defaultProps = {
  heading: '',
  getMoreBtnData: null,
};

const LibItemsList = ({
  heading, list, getItemClickHandler, listStyle, getMoreBtnData,
}) => {
  const getSubtitle = (element) => {
    switch (element.playerType) {
      case 'Korrepetition': {
        if (element.metaData.composer) {
          return `${
            element.metaData.composer.firstname} ${element.metaData.composer.lastname}`;
        }
        return '';
      }
      case 'Ensemble_Band': {
        if (element.metaData.interpreter) return element.metaData.interpreter.name;
        return '';
      }
      default: {
        return '';
      }
    }
  };
  if (listStyle === 'grid') {
    return (
      <>
        {list.length > 0
      && (
        <>
          {(heading || getMoreBtnData) && <ListHeadingComponent heading={heading} getMoreBtnData={getMoreBtnData} />}
          <Row breakpoint="sm" className="flex-wrap">
            {(list).map((element) => (
              <Col className="marginTop margin-left-0" key={`col_${element.idLibElement}`}>
                <LibraryItem
                  title={element.metaData.shortTitle || ''}
                  subtitle={getSubtitle(element)}
                  cover={element.metaData.coverImagePath ? getFilePath(
                    element.metaData.coverImagePath, element,
                  ) : '/img/logo.png'}
                  onClickHandler={getItemClickHandler(element)}
                />
              </Col>
            ))}
          </Row>
        </>
      )}

      </>
    );
  }
  return (
    <>
      <ListHeadingComponent heading={heading} getMoreBtnData={getMoreBtnData} />
      <LibraryHorizontalList className="lib-horizontal">
        {(list || []).map((element) => (
          <LibraryItem
            key={`fav_item_${element.idLibElement}`}
            title={element.metaData.shortTitle}
            subtitle={getSubtitle(element)}
            cover={element.metaData.coverImagePath ? getFilePath(
              element.metaData.coverImagePath, element,
            ) : '/img/logo.png'}
            onClickHandler={getItemClickHandler(element)}
          />
        ))}
      </LibraryHorizontalList>
    </>
  );
};
LibItemsList.propTypes = {
  heading: PropTypes.string,
  getMoreBtnData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    link: PropTypes.string,
    function: PropTypes.func,
  }),
  list: PropTypes.arrayOf(PropTypes.shape({
    idLibElement: PropTypes.number.isRequired,
    metaData: PropTypes.shape({
      coverImagePath: PropTypes.string,
      shortTitle: PropTypes.string,
    }),
  })),
  getItemClickHandler: PropTypes.func,
  listStyle: PropTypes.string,
};
LibItemsList.defaultProps = {
  heading: '',
  getMoreBtnData: null,
  listStyle: null,
  getItemClickHandler: () => {},
  list: [],
};
export default LibItemsList;
