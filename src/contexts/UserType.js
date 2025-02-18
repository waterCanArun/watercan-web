import React, { createContext, useContext, useState } from 'react';

// Create a new context object
const UserTypeContext = createContext();

// Export a custom hook to use the context
export const useUserType = () => useContext(UserTypeContext);

// Create a provider component
export const UserTypeProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
//true for admin
// false for customer
  return (
    <UserTypeContext.Provider value={{ userType, setUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
};
