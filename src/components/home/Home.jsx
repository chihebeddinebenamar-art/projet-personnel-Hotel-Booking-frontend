import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import MainHeader from "../layout/MainHeader";
import Parallax from "../common/Parallax";
import HotelService from "../common/HotelService";
import RoomCarousel from "../common/RoomCarousel";

const Home = () => {
    return (
        <div className="home-page">
            <MainHeader />

            <section className="home-intro py-5">
                <Container>
                    <Row className="align-items-center g-4">
                        <Col lg={7}>
                            <h2 className="h3 mb-3">
                                Votre confort, notre priorité
                            </h2>
                            <p className="text-secondary mb-3 mb-lg-0">
                                Profitez d’un espace calme, de services soignés et d’une
                                expérience fluide du choix de la chambre à la confirmation de
                                votre séjour.
                            </p>
                        </Col>
                        <Col lg={5} className="text-lg-end">
                            <Link
                                to="/browse-all-rooms"
                                className="btn btn-outline-secondary rounded-pill px-4"
                            >
                                Parcourir toutes les chambres
                            </Link>
                        </Col>
                    </Row>
                </Container>
            </section>

            <section className="home-rooms bg-light py-5 border-top border-bottom">
                <Container>
                    <div className="text-center mb-4">
                        <h2 className="h4 mb-2">Aperçu des chambres</h2>
                        <p className="text-secondary small mb-0">
                            Quelques types de chambres disponibles — réservez en quelques clics.
                        </p>
                    </div>
                    <RoomCarousel />
                </Container>
            </section>

            <Parallax />

            <HotelService />

            <section className="home-cta py-5">
                <Container>
                    <div className="home-cta-inner rounded-4 p-4 p-md-5 text-center text-white">
                        <h2 className="h4 mb-2">Envie d’éviter les files d’attente ?</h2>
                        <p className="mb-4 opacity-90 small mx-auto" style={{ maxWidth: "32rem" }}>
                            Connectez-vous à l’espace administrateur pour gérer les chambres et
                            suivre les réservations (compte démo prévu côté backend).
                        </p>
                        <Link
                            to="/login"
                            className="btn btn-light btn-sm rounded-pill px-4 text-dark fw-semibold"
                        >
                            Accéder à la connexion
                        </Link>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Home;
