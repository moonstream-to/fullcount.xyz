import React, { useState, useEffect, useCallback, useContext, createContext } from "react";
import http from "axios";
import { AUTH_URL } from "../../services/auth.service";

type UserContextType = {
  user: any;
};

const UserContext = createContext<UserContextType | any>(null); //TODO

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getUser = useCallback(() => {
    const token = localStorage.getItem("FULLCOUNT_ACCESS_TOKEN");
    if (!token) {
      return setUser(null);
    }
    setIsLoading(true);
    console.log(token);
    const headers = { Authorization: `Bearer ${token}` };
    http
      .get(`${AUTH_URL}/user`, { headers })
      .then(
        (response) => {
          setUser(response.data);
        },
        (reason) => {
          if (reason.response.data === "Access token not found") {
            localStorage.removeItem("FULLCOUNT_ACCESS_TOKEN");
            setUser(null);
          }
        },
      )
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      getUser();
    }
    return () => {
      isMounted = false;
    };
  }, [getUser]);

  return (
    <UserContext.Provider value={{ user, setUser, getUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useUser must be used within UserContext");
  }

  return context;
};

export default useUser;
