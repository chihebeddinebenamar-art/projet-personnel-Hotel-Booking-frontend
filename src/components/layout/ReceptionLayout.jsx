import { NavLink, Outlet, Link } from "react-router-dom";
import {
    FaCalendarCheck,
    FaSignOutAlt,
    FaHome,
    FaConciergeBell,
    FaThLarge,
    FaUsers,
    FaRegCalendarAlt,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

const ReceptionLayout = () => {
    const { refresh } = useAuth();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        refresh();
        window.location.href = "/";
    };

    const linkClass = ({ isActive }) =>
        `admin-sidebar-link d-flex align-items-center gap-2 ${isActive ? "active" : ""}`;

    return (
        <div className="admin-shell d-flex min-vh-100">
            <aside className="admin-sidebar text-white flex-shrink-0">
                <div className="p-4 border-bottom border-white border-opacity-10">
                    <div className="fw-bold fs-5">SmartHotelPlus</div>
                    <div className="small text-white-50 mt-1">Espace réception</div>
                </div>
                <nav className="p-3 d-flex flex-column gap-1">
                    <NavLink to="/reception" end className={linkClass}>
                        <FaThLarge /> Accueil
                    </NavLink>
                    <NavLink to="/reception/reservations" className={linkClass}>
                        <FaCalendarCheck /> Réservations du jour
                    </NavLink>
                    <NavLink to="/reception/client-history" className={linkClass}>
                        <FaUsers /> Clients & historique
                    </NavLink>
                    <NavLink to="/reception/planning" className={linkClass}>
                        <FaRegCalendarAlt /> Planning global
                    </NavLink>
                    <hr className="border-white border-opacity-10 my-2" />
                    <Link
                        to="/"
                        className="admin-sidebar-link d-flex align-items-center gap-2 text-decoration-none text-white-50"
                    >
                        <FaHome /> Site public
                    </Link>
                    <button
                        type="button"
                        className="btn btn-link admin-sidebar-link text-start text-white-50 p-0 border-0 d-flex align-items-center gap-2"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt /> Déconnexion
                    </button>
                </nav>
                <div className="mt-auto p-3 small text-white-50 border-top border-white border-opacity-10">
                    <FaConciergeBell className="me-1" />
                    Compte réception
                </div>
            </aside>
            <main className="admin-main flex-grow-1 bg-light">
                <div className="container-fluid py-4 px-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ReceptionLayout;
