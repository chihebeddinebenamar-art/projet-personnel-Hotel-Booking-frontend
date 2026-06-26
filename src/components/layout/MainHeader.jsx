import React from "react";
import { Link } from "react-router-dom";

const MainHeader = () => {
    return (
        <section className="home-hero">
            <div className="home-hero-bg" aria-hidden />
            <div className="home-hero-overlay" />
            <div className="container position-relative home-hero-content py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-9 col-xl-8 text-center text-white">
                        <p className="home-hero-kicker text-uppercase small mb-2">
                            Séjours &amp; hospitalité
                        </p>
                        <h1 className="home-hero-title display-4 fw-semibold mb-3">
                            Bienvenue à{" "}
                            <span className="hotel-color">SmartHotelPlus</span>
                        </h1>
                        <p className="home-hero-sub lead mb-4 mx-auto">
                            Chambres élégantes, réservation en ligne et une équipe à votre
                            écoute pour un séjour sans stress.
                        </p>
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            <Link
                                to="/browse-all-rooms"
                                className="btn btn-hotel btn-lg px-4 rounded-pill"
                            >
                                Réserver une chambre
                            </Link>
                            <Link
                                to="/about"
                                className="btn btn-outline-light btn-lg px-4 rounded-pill"
                            >
                                Découvrir l’hôtel
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MainHeader;
