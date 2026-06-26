import { NavLink, Outlet, Link } from "react-router-dom";
import {
    FaThLarge,
    FaDoorOpen,
    FaPlus,
    FaList,
    FaCalendarCheck,
    FaSignOutAlt,
    FaHome,
    FaTags,
    FaToolbox,
    FaUserFriends,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

const AdminLayout = () => {
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
                    <div className="small text-white-50 mt-1">Espace administrateur</div>
                </div>
                <nav className="p-3 d-flex flex-column gap-1">
                    <NavLink to="/admin" end className={linkClass}>
                        <FaThLarge /> Tableau de bord
                    </NavLink>
                    <NavLink to="/add-room" className={linkClass}>
                        <FaPlus /> Ajouter une chambre
                    </NavLink>
                    <NavLink to="/existing-rooms" className={linkClass}>
                        <FaList /> Chambres (liste)
                    </NavLink>
                    <NavLink to="/admin/room-types" className={linkClass}>
                        <FaTags /> Types de chambres
                    </NavLink>
                    <NavLink to="/admin/accessories" className={linkClass}>
                        <FaToolbox /> Accessoires
                    </NavLink>
                    <NavLink to="/admin/receptionists" className={linkClass}>
                        <FaUserFriends /> Réceptionnistes
                    </NavLink>
                    <NavLink to="/admin/reservations" className={linkClass}>
                        <FaCalendarCheck /> Réservations
                    </NavLink>
                    <hr className="border-white border-opacity-10 my-2" />
                    <Link
                        to="/"
                        className="admin-sidebar-link d-flex align-items-center gap-2 text-decoration-none text-white-50"
                    >
                        <FaHome /> Retour au site
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
                    <FaDoorOpen className="me-1" />
                    Gestion des chambres réservée à l&apos;admin
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

export default AdminLayout;
