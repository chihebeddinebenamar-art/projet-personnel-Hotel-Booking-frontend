import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaLeaf, FaShieldAlt, FaHeart } from "react-icons/fa";

const About = () => {
    return (
        <div className="about-page">
            <section className="about-hero position-relative">
                <div className="about-hero-overlay" aria-hidden />
                <Container className="position-relative py-5" style={{ zIndex: 1 }}>
                    <Row className="justify-content-center text-center text-white py-lg-5">
                        <Col lg={8}>
                            <p className="about-kicker text-uppercase small mb-2">
                                Notre histoire
                            </p>
                            <h1 className="display-5 fw-semibold mb-3">
                                Bienvenue chez{" "}
                                <span className="hotel-color">SmartHotelPlus</span>
                            </h1>
                            <p className="lead opacity-90 mb-0">
                                Nous combinons le confort d’un hôtel moderne avec une équipe
                                attentive, pour que chaque voyageur se sente comme chez lui.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            <Container className="py-5">
                <Row className="g-4 align-items-center mb-5">
                    <Col lg={6}>
                        <h2 className="h3 mb-3">Notre mission</h2>
                        <p className="text-secondary">
                            Offrir des séjours sereins grâce à des chambres soignées, une
                            réservation simple et un service réactif. Que vous voyagiez pour
                            affaires ou pour le plaisir, nous mettons l’accent sur la qualité
                            et la transparence.
                        </p>
                        <p className="text-secondary mb-0">
                            Cette application de démonstration illustre la gestion des chambres,
                            des réservations et de l’espace administrateur pour un hôtel
                            contemporain.
                        </p>
                    </Col>
                    <Col lg={6}>
                        <div className="about-card p-4 rounded-4 border bg-white shadow-sm">
                            <h3 className="h5 mb-3 hotel-color">Pourquoi nous choisir</h3>
                            <ul className="list-unstyled mb-0">
                                <li className="d-flex gap-3 mb-3">
                                    <span className="about-icon-wrap">
                                        <FaLeaf />
                                    </span>
                                    <span>
                                        <strong className="d-block">Cadre agréable</strong>
                                        <span className="text-secondary small">
                                            Espaces lumineux et équipements pensés pour le repos.
                                        </span>
                                    </span>
                                </li>
                                <li className="d-flex gap-3 mb-3">
                                    <span className="about-icon-wrap">
                                        <FaShieldAlt />
                                    </span>
                                    <span>
                                        <strong className="d-block">Réservations sécurisées</strong>
                                        <span className="text-secondary small">
                                            Processus clair et suivi de vos confirmations.
                                        </span>
                                    </span>
                                </li>
                                <li className="d-flex gap-3">
                                    <span className="about-icon-wrap">
                                        <FaHeart />
                                    </span>
                                    <span>
                                        <strong className="d-block">Accueil humain</strong>
                                        <span className="text-secondary small">
                                            Une équipe à l’écoute avant, pendant et après votre séjour.
                                        </span>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </Col>
                </Row>

                <Row className="justify-content-center text-center">
                    <Col md={8} className="about-cta rounded-4 p-4 p-md-5">
                        <h2 className="h4 mb-3">Prêt à réserver ?</h2>
                        <p className="text-secondary mb-4">
                            Parcourez nos chambres et choisissez celle qui vous correspond.
                        </p>
                        <Link
                            to="/browse-all-rooms"
                            className="btn btn-hotel btn-lg rounded-pill px-4 me-2 mb-2"
                        >
                            Voir les chambres
                        </Link>
                        <Link
                            to="/"
                            className="btn btn-outline-secondary btn-lg rounded-pill px-4 mb-2"
                        >
                            Retour à l’accueil
                        </Link>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default About;
