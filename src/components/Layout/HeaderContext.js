import React, {
  useState, useContext, useEffect, useRef,
} from 'react';

const HeaderContext = React.createContext({
  menuSettings: { heading: '' },
  setMenuSettings: () => {},
});

export default HeaderContext;
