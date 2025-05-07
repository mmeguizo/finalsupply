interface SessionsType {
  user?: {
    id?: string | null;
    name?: string | null;
    image?: string | null;
    email?: string | null;
    role?: "admin" | "user"; // Add role field
  };
}



export type { SessionsType };
