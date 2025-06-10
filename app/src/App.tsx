import { SessionProvider } from "./auth/SessionContext";
import { AppContent } from "./auth/components/AppContent";

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
