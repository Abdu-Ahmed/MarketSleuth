import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const [needsVerification, setNeedsVerification] = useState(false);

  const setTokens = (access, refresh) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  useEffect(() => {
    if (accessToken) {
      fetch(`${import.meta.env.VITE_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })
        .then(res => {
          if (!res.ok) throw new Error("Session expired");
          return res.json();
        })
        .then(userData => {
          setUser(userData);
          if (!userData.email_verified) setNeedsVerification(true);
        })
        .catch(logout);
    } else {
      logout();
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        setTokens,
        setUser,
        logout,
        needsVerification,
        setNeedsVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
