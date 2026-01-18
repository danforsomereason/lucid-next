'use client'

import { User } from "@/types";
import { createContext, Dispatch, SetStateAction } from "react";

export interface GlobalValue {
    currentUser?: User
    setCurrentUser: Dispatch<SetStateAction<User | undefined>>;
}

export const globalContext = createContext<GlobalValue | undefined>(undefined);
