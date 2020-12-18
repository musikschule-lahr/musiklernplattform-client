import React, { useState } from 'react';
import { Switch } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import StartIcon from 'musiklernplattform-components/iconify/icon-start';
import StartIconActive from 'musiklernplattform-components/iconify/icon-start-active';
import BueroIcon from 'musiklernplattform-components/iconify/icon-mein-buero';
import BueroIconActive from 'musiklernplattform-components/iconify/icon-mein-buero-active';
import ProjectIcon from 'musiklernplattform-components/iconify/icon-meine-projekte';
import ProjectIconActive from 'musiklernplattform-components/iconify/icon-meine-projekte-active';
import ProfileIcon from 'musiklernplattform-components/iconify/icon-mein-profil';
import ProfileIconActive from 'musiklernplattform-components/iconify/icon-mein-profil-active';
import TimetableIcon from 'musiklernplattform-components/iconify/icon-stundenplan';
import TimetableIconActive from 'musiklernplattform-components/iconify/icon-stundenplan-active';
import SearchIcon from 'musiklernplattform-components/iconify/icon-suchen';
import SearchIconActive from 'musiklernplattform-components/iconify/icon-suchen-active';
import MediaIcon from 'musiklernplattform-components/iconify/icon-mediathek';
import MediaIconActive from 'musiklernplattform-components/iconify/icon-mediathek-active';
import ManagementIcon from 'musiklernplattform-components/iconify/icon-verwaltung';
import ManagementIconActive from 'musiklernplattform-components/iconify/icon-verwaltung-active';
import Header from './Header';
import Menu from './Menu';
import SpecificRoute from './SpecificRoute';
import PlansAndMatrixRelationRoomsProvider from './PlansAndMatrixRelationRoomsProvider';
import UserProfile from '~/components/Profile';
import Login from '~/components/Login';
import UserBoard from '~/components/UserBoard';
import Management from '~/components/Management';
import Home from '~/components/Home';
import Timetable from '~/components/Timetable';
import Scanner from '~/components/Scanner';
import Library from '~/components/Library';
import Player from '~/components/Player';
import Search from '~/components/Search';
import Projects from '~/components/Projects';
import { plans } from '~/constants/util';
import HeaderContext from './HeaderContext';

const Routes = () => {
  const { keycloak } = useKeycloak();
  const [menuSettings, setMenuSettings] = useState({
    heading: '',
  });
  const value = { menuSettings, setMenuSettings };

  const routes = [
    {
      heading: 'Start',
      showInMenu: false,
      isPrivate: true,
      path: '/',
      isExact: true,
      component: Home,
      shownOnlyFor: [plans.STUDENT, plans.NONE],
      routePlans: [plans.STUDENT, plans.NONE, plans.TEACHER, plans.PARENT],
      showBackBtn: false,
      icon: StartIcon,
      iconActive: StartIconActive,
    },
    {
      heading: 'Start',
      showInMenu: true,
      isPrivate: true,
      path: '/home',
      isExact: true,
      component: Home,
      shownOnlyFor: [plans.STUDENT, plans.NONE],
      routePlans: [plans.STUDENT, plans.NONE, plans.TEACHER, plans.PARENT],
      showBackBtn: false,
      icon: StartIcon,
      iconActive: StartIconActive,
    },
    {
      showInMenu: false,
      isPrivate: false,
      path: '/login',
      isExact: false,
      component: Login,
      showBackBtn: false,
    },
    {
      heading: 'Mein Büro',
      showInMenu: true,
      isPrivate: true,
      path: '/board',
      isExact: true,
      component: UserBoard,
      showBackBtn: false,
      routePlans: [plans.STUDENT, plans.TEACHER, plans.PARENT],
      icon: BueroIcon,
      iconActive: BueroIconActive,
    },
    {
      heading: 'Stundenplan',
      showInMenu: true,
      isPrivate: true,
      path: '/timetable',
      isExact: false,
      component: Timetable,
      showBackBtn: false,
      routePlans: [plans.TEACHER],
      icon: TimetableIcon,
      iconActive: TimetableIconActive,
    },
    {
      heading: 'Verwaltung',
      showInMenu: true,
      isPrivate: true,
      path: '/management',
      isExact: false,
      component: Management,
      showBackBtn: false,
      icon: ManagementIcon,
      iconActive: ManagementIconActive,
      routePlans: [plans.TEACHER],
    },
    {
      heading: 'Mein Profil',
      showInMenu: true,
      shownOnlyFor: [plans.NONE, plans.PARENT],
      isPrivate: true,
      path: '/profile',
      isExact: true,
      component: UserProfile,
      showBackBtn: true,
      routePlans: [plans.STUDENT, plans.NONE, plans.TEACHER, plans.PARENT],
      icon: ProfileIcon,
      iconActive: ProfileIconActive,
    },
    {
      heading: 'Mein Profil',
      showInMenu: false,
      isPrivate: true,
      path: '/board/profile',
      isExact: true,
      component: UserProfile,
      showBackBtn: true,
      routePlans: [plans.STUDENT, plans.NONE, plans.TEACHER, plans.PARENT],
      icon: ProfileIcon,
      iconActive: ProfileIconActive,
    },
    {
      heading: 'Meine Projekte',
      showInMenu: false,
      isPrivate: true,
      path: '/projects',
      isExact: true,
      component: Projects,
      showBackBtn: false,
      routePlans: [plans.STUDENT, plans.TEACHER],
      icon: ProjectIcon,
      iconActive: ProjectIconActive,
    },

    {
      heading: 'Mediathek',
      showInMenu: true,
      isPrivate: true,
      path: '/library',
      isExact: false,
      component: Library,
      showBackBtn: false,
      routePlans: [plans.STUDENT, plans.TEACHER, plans.PARENT],
      icon: MediaIcon,
      iconActive: MediaIconActive,
    },
    {
      heading: 'Suchen',
      showInMenu: false,
      isPrivate: true,
      path: '/library/search',
      isExact: true,
      component: Search,
      showBackBtn: true,
      routePlans: [plans.STUDENT, plans.TEACHER, plans.PARENT],
      icon: SearchIcon,
      iconActive: SearchIconActive,
    },
    {
      heading: 'Suchen',
      showInMenu: true,
      isPrivate: true,
      path: '/search',
      isExact: false,
      component: Search,
      shownOnlyFor: [plans.STUDENT],
      showBackBtn: false,
      routePlans: [plans.STUDENT, plans.TEACHER, plans.PARENT],
      icon: SearchIcon,
      iconActive: SearchIconActive,
    },
    {
      heading: 'Player',
      showInMenu: false,
      isPrivate: true,
      path: '/player/:path',
      isExact: false,
      component: Player,
      showBackBtn: true,
      hideLogo: true,
      routePlans: [plans.STUDENT, plans.TEACHER, plans.PARENT],
    },
    {
      heading: 'QR-Code-Scanner',
      showInMenu: false,
      isPrivate: true,
      path: '/qr',
      isExact: true,
      component: Scanner,
      showBackBtn: true,
      routePlans: [],
    },
  ];
  return (
    <>
      <PlansAndMatrixRelationRoomsProvider>
        <HeaderContext.Provider value={value}>
          <Header />
          <Switch>
            {routes.map((route) => (
              <SpecificRoute
                key={`${route.heading}Route`}
                heading={route.heading}
                isPrivate={route.isPrivate}
                path={route.path}
                exact={route.isExact}
                component={route.component}
                actionItemIcon={route.actionItemIcon}
                showBackBtn={route.showBackBtn}
                routePlans={route.routePlans}
                hideLogo={route.hideLogo}
              />
            ))}
          </Switch>
          {keycloak.authenticated && <Menu items={routes} /> }
        </HeaderContext.Provider>
      </PlansAndMatrixRelationRoomsProvider>
    </>
  );
};

export default Routes;
