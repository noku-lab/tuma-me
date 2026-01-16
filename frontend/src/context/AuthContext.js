import React from 'react';

export const AuthContext = React.createContext({
  signIn: () => {},
  signOut: () => {},
  user: null,
  token: null,
});

