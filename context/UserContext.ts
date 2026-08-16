import { createContext, useContext } from "react";
import { UserContextValue } from "@/types";


const UserContext = createContext<UserContextValue | undefined>(undefined);

export default UserContext;

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}