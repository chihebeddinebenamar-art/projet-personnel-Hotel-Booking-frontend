import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/** Admin ou réceptionniste connecté (JWT). */
const RequireStaff = () => {
    const { isStaff, isLoggedIn } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (!isStaff) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default RequireStaff;
