import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { FaHotel, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <footer className="site-footer mt-auto">
            <Container className="py-5">
                <Row className="g-4">
                    <Col md={4}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="site-logo-icon site-logo-icon--footer">
                                <FaHotel aria-hidden />
                            </span>
                            <span className="site-brand-text text-white fs-5">SmartHotelPlus</span>
                        </div>
                        <p className="site-footer-lead mb-0">
                            Un séjour pensé pour le confort, la simplicité et une hospitalité
                            chaleureuse au cœur de la ville.
                        </p>
                    </Col>
                    <Col md={4}>
                        <h6 className="text-white text-uppercase small fw-semibold mb-3">
                            Liens utiles
                        </h6>
                        <ul className="list-unstyled site-footer-links mb-0">
                            <li>
                                <Link to="/browse-all-rooms">Nos chambres</Link>
                            </li>
                            <li>
                                <Link to="/reservations">Mes réservations</Link>
                            </li>
                            <li>
                                <Link to="/about">À propos</Link>
                            </li>
                            <li>
                                <Link to="/login">Connexion</Link>
                            </li>
                        </ul>
                    </Col>
                    <Col md={4}>
                        <h6 className="text-white text-uppercase small fw-semibold mb-3">
                            Contact
                        </h6>
                        <p className="site-footer-contact mb-2">
                            <FaMapMarkerAlt className="me-2 hotel-color" aria-hidden />
                            Tunis, Tunisie
                        </p>
                        <p className="site-footer-contact mb-0">
                            <FaEnvelope className="me-2 hotel-color" aria-hidden />
                            contact@smarthotelplus.local
                        </p>
                    </Col>
                </Row>
                <hr className="site-footer-divider my-4" />
                <p className="text-center site-footer-copy mb-0 small">
                    &copy; {year} SmartHotelPlus. Tous droits réservés.
                </p>
            </Container>
        </footer>
    );
};

export default Footer;
