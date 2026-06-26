import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FaHotel } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";

const NavBar = () => {
    const { isAdmin, isLoggedIn, isStaff, isClient } = useAuth();
    const userEmail = typeof localStorage !== "undefined" ? localStorage.getItem("userEmail") : "";

    return (
        <header className="site-header">
            <nav className="navbar navbar-expand-lg site-navbar">
                <div className="container py-2">
                    <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                        <span className="site-logo-icon">
                            <FaHotel aria-hidden />
                        </span>
                        <span className="site-brand-text">SmartHotelPlus</span>
                    </Link>
                    <button
                        className="navbar-toggler border-0 shadow-none"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#siteNav"
                        aria-controls="siteNav"
                        aria-expanded="false"
                        aria-label="Menu"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="siteNav">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">
                            <li className="nav-item">
                                <NavLink className="nav-link site-nav-link" to="/">
                                    Accueil
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink
                                    className="nav-link site-nav-link"
                                    to="/browse-all-rooms"
                                >
                                    Chambres
                                </NavLink>
                            </li>
                            {isLoggedIn && isClient && (
                                <li className="nav-item">
                                    <NavLink
                                        className="nav-link site-nav-link"
                                        to="/reservations"
                                    >
                                        Mes réservations
                                    </NavLink>
                                </li>
                            )}
                            <li className="nav-item">
                                <NavLink className="nav-link site-nav-link" to="/about">
                                    À propos
                                </NavLink>
                            </li>
                            {isLoggedIn ? (
                                <>
                                    {isAdmin && (
                                        <li className="nav-item">
                                            <NavLink
                                                className="nav-link site-nav-link"
                                                to="/admin"
                                            >
                                                Tableau admin
                                            </NavLink>
                                        </li>
                                    )}
                                    {isStaff && !isAdmin && (
                                        <li className="nav-item">
                                            <NavLink
                                                className="nav-link site-nav-link"
                                                to="/reception"
                                            >
                                                Espace réception
                                            </NavLink>
                                        </li>
                                    )}
                                    {isClient && (
                                        <li className="nav-item">
                                            <NavLink
                                                className="nav-link site-nav-link"
                                                to="/profile"
                                            >
                                                Mon profil
                                            </NavLink>
                                        </li>
                                    )}
                                    <li className="nav-item d-none d-lg-block">
                                        <span className="nav-link small text-muted py-2">
                                            {userEmail}
                                        </span>
                                    </li>
                                    <li className="nav-item ps-lg-2">
                                        <Link
                                            className="btn btn-outline-secondary btn-sm px-3 rounded-pill"
                                            to="/logout"
                                        >
                                            Déconnexion
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link
                                            className="nav-link site-nav-link"
                                            to="/login"
                                        >
                                            Connexion
                                        </Link>
                                    </li>
                                    <li className="nav-item ps-lg-2">
                                        <Link
                                            className="btn btn-hotel btn-sm px-3 rounded-pill"
                                            to="/register"
                                        >
                                            Inscription
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default NavBar;
