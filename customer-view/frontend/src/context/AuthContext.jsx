import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('app_users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });

  const [user, setUser] = useState(() => {
    const savedSession = localStorage.getItem('app_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('app_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('app_session');
    }
  }, [user]);

  const signup = (name, email, password) => {
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists with this email.');
    }
    const newUser = { name, email, password };
    setUsers([...users, newUser]);
  };

  const login = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('Invalid username or password. Please create an account.');
    }
    setUser(foundUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
