import React, { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./auth-context";

function readRole() {
    return localStorage.getItem("userRole") || "";
}

function readToken() {
    return localStorage.getItem("token") || "";
}

export function AuthProvider({ children }) {
    const [tick, setTick] = useState(0);

    const refresh = useCallback(() => {
        setTick((t) => t + 1);
    }, []);

    const value = useMemo(() => {
        void tick;
        const role = readRole();
        const token = readToken();
        return {
            role,
            token,
            isAdmin: role === "ADMIN",
            isReceptionist: role === "RECEPTIONIST",
            isClient: role === "CLIENT" || role === "STAFF",
            isStaff: role === "ADMIN" || role === "RECEPTIONIST",
            isLoggedIn: Boolean(token),
            refresh,
        };
    }, [tick, refresh]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
