// src/auth/SessionContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { SessionsType } from "../types/genericTypes";
import { getStoredSession, saveSession } from "./authUtils";

interface SessionContextType {
  session: SessionsType | null;
  setSession: (session: SessionsType | null) => void;
}

export const SessionContext = createContext<SessionContextType>({
  session: null,
  setSession: () => {},
});

export const SessionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [session, setSession] = useState<SessionsType | null>(getStoredSession());

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      saveSession(session);
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

//TODO clean up code in the future

// import * as React from "react";
// // import type { Session } from "@toolpad/core";

// import { SessionsType } from "../types/genericTypes";

// export interface SessionContextValue {
//   session: SessionsType | null;
//   setSession: (session: SessionsType | null) => void;
// }

// // Load session from localStorage when the app starts
// const storedSession = localStorage.getItem("session");
// const initialSession: SessionsType | null = storedSession
//   ? JSON.parse(storedSession)
//   : null;

// export const SessionContext = React.createContext<SessionContextValue>({
//   session: initialSession,
//   setSession: () => {},
// });

// export function SessionProvider({ children }: { children: React.ReactNode }) {
//   const [session, setSession] = React.useState<SessionsType | null>(
//     initialSession
//   );

//   // Save session to localStorage whenever it changes
//   React.useEffect(() => {
//     if (session) {
//       localStorage.setItem("session", JSON.stringify(session));
//     } else {
//       localStorage.removeItem("session");
//     }
//   }, [session]);

//   return (
//     <SessionContext.Provider value={{ session, setSession }}>
//       {children}
//     </SessionContext.Provider>
//   );
// }

// export function useSession() {
//   return React.useContext(SessionContext);
// }
