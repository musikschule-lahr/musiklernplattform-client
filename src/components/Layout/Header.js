import React, { useContext, useCallback } from 'react';
import { useHistory, Link } from 'react-router-dom';
import BackIcon from '@iconify/icons-ion/chevron-back';
import { TextButton } from 'musiklernplattform-components';
import HeaderContext from './HeaderContext';

const Header = () => {
  const history = useHistory();

  const { menuSettings } = useContext(HeaderContext);

  const backBtnHandler = useCallback(() => {
    if (menuSettings.backBtnPath) {
      history.push(menuSettings.backBtnPath);
    } else {
      history.goBack();
    }
  }, [menuSettings.backBtnPath, history]);
  return (
    <div className={menuSettings.hideLogo ? 'header hideLogo' : 'header'}>
      <div className={menuSettings.hideLogo ? 'headerRow1 noIcon' : 'headerRow1'}>

        <div
          className={menuSettings.hideLogo ? 'headerLogo hideLogo' : 'headerLogo '}
        >
          {menuSettings.hideLogo ? (
            <div className="noIconHeading">
              <span>{menuSettings.heading || 'None yet'}</span>
            </div>
          ) : (
            <Link
              to="/home"
              style={{
                display: 'inline-flex',
              }}
            >
              <img
                src={process.env.HEADER_IMAGE}
                style={{
                  height: '33px',
                }}
                alt="App"
              />
            </Link>
          )}
        </div>

        <div className="headerBackBtn">
          {menuSettings.showBackBtn
          && (
          <TextButton
            removePadding
            icon={BackIcon}
            onClickHandler={backBtnHandler}
            disabled={history.length === 0}
            title={menuSettings.backBtnText || 'Zurück'}
          />
          )}
        </div>

        <div
          className={menuSettings.hideLogo ? 'headerAction noIcon' : 'headerAction'}
        >
          {menuSettings.actionItems && menuSettings.actionItems}
        </div>
      </div>
      {!menuSettings.hideLogo && (
      <div className="headerRow2">
        <div className="headerHeading">
          <span>{menuSettings.heading}</span>
        </div>
      </div>
      )}

    </div>
  );
};
/*
Header.propTypes = {
  heading: PropTypes.string.isRequired,
  showBackBtn: PropTypes.bool,
  backBtnPath: PropTypes.string,
  backBtnText: PropTypes.string,
  actionItems: PropTypes.node,
  hideLogo: PropTypes.bool,

};
Header.defaultProps = {
  showBackBtn: true,
  backBtnPath: null,
  backBtnText: 'Zurück',
  actionItems: null,
  hideLogo: false,
}; */

export default Header;
