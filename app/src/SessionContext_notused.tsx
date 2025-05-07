import * as React from "react";
// import type { Session } from "@toolpad/core";

import { SessionsType } from "./types/genericTypes";

export interface SessionContextValue {
  session: SessionsType | null;
  setSession: (session: SessionsType | null) => void;
}

// Load session from localStorage when the app starts
const storedSession = localStorage.getItem("session");
const initialSession: SessionsType | null = storedSession
  ? JSON.parse(storedSession)
  : null;

export const SessionContext = React.createContext<SessionContextValue>({
  session: initialSession,
  setSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<SessionsType | null>(
    initialSession
  );

  // Save session to localStorage whenever it changes
  React.useEffect(() => {
    if (session) {
      localStorage.setItem("session", JSON.stringify(session));
    } else {
      localStorage.removeItem("session");
    }
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return React.useContext(SessionContext);
}
