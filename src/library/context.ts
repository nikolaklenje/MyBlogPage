import { createContext } from 'react';

const ContextMain = createContext({
  isLogin: null,
  setIsLogin: () => {},
});

export default ContextMain;
