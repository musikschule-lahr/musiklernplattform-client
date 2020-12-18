import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { TextButton, NavItem, TabNav } from 'musiklernplattform-components';
import star from '@iconify/icons-ion/ios-star';
import { Route, Link } from 'react-router-dom';
import { usePlans } from '~/constants/hooks';

const NavLink = ({
  to,
  children,
  className,
  activeClassName,
  ...rest
}) => {
  const path = typeof to === 'object' ? to.pathname : to;
  return (
    <Route
      path={path}
    >
      {({ match }) => {
        const isActive = !!match;
        return (
          <Link
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            className={
              isActive
                ? [className, activeClassName].filter((i) => i).join(' ')
                : className
            }
            to={to}
          >
            {typeof children === 'function' ? children(isActive) : children}
          </Link>
        );
      }}
    </Route>
  );
};
NavLink.propTypes = {
  activeClassName: PropTypes.string,
  className: PropTypes.string,
  to: PropTypes.string,
  children: PropTypes.func,
};
NavLink.defaultProps = {
  activeClassName: 'active',
  className: '',
  to: '/',
  children: () => (<></>),

};
const Menu = ({ items }) => {
  const { loading: loadingPlans, comparePlans } = usePlans();

  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (!loadingPlans) {
      let itemList = [...items];
      itemList = itemList.filter((item) => item.showInMenu);
      itemList = itemList.filter((item) => (item.shownOnlyFor || []).length === 0 || comparePlans(item.shownOnlyFor));
      itemList = itemList.filter((item) => item.routePlans.length === 0 || comparePlans(item.routePlans));
      setMenuItems(itemList);
    }
  }, [comparePlans, items, loadingPlans]);

  const menuClickHandler = () => {
  };
  return (
    <TabNav className="menu">
      {menuItems
        .map((item) => (
          <NavItem key={`${item.heading}_MenuItem`}>
            <NavLink to={item.path} activeClassName="navlink-active">
              {(isActive) => (
                <TextButton
                  className="navlink-btn"
                  // eslint-disable-next-line no-nested-ternary
                  icon={item.icon ? (isActive && item.iconActive ? item.iconActive : item.icon) : star}
                  title={item.heading}
                  onClickHandler={menuClickHandler}
                />
              )}
            </NavLink>
          </NavItem>
        ))}
    </TabNav>
  );
};

Menu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.string,
      path: PropTypes.string,
      showInMenu: PropTypes.bool,
    }),
  ),
};
Menu.defaultProps = {
  items: [],
};
export default Menu;
