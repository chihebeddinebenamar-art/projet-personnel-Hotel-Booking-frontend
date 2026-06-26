import React, { useMemo, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { getApiErrorMessage, getClientHistoryByEmail } from "../utils/ApiFunctions";

function sortBookingsByCheckInDesc(list) {
    return [...list].sort((a, b) => (b.checkInDate || "").localeCompare(a.checkInDate || ""));
}

const ReceptionClientHistory = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [bookings, setBookings] = useState([]);

    const normalizedEmail = email.trim().toLowerCase();
    const today = new Date().toISOString().slice(0, 10);

    const { past, upcoming, profile } = useMemo(() => {
        const safe = Array.isArray(bookings) ? bookings : [];
        const sorted = sortBookingsByCheckInDesc(safe);
        const pastStays = sorted.filter((b) => (b.checkOutDate || "") < today);
        const upcomingStays = sorted.filter((b) => (b.checkOutDate || "") >= today);
        const first = sorted[0];
        return {
            past: pastStays,
            upcoming: upcomingStays,
            profile: first
                ? {
                      fullName: first.guestFullName || "—",
                      email: first.guestEmail || normalizedEmail || "—",
                  }
                : null,
        };
    }, [bookings, normalizedEmail, today]);

    const onSearch = async (e) => {
        e.preventDefault();
        setError("");
        setBookings([]);
        if (!normalizedEmail) {
            setError("Veuillez saisir un email client.");
            return;
        }
        setLoading(true);
        try {
            const data = await getClientHistoryByEmail(normalizedEmail);
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="h3 mb-2">Informations client et historique</h1>
            <p className="text-secondary mb-4">
                Recherchez un client par email pour consulter ses séjours passés et à venir.
            </p>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Form onSubmit={onSearch}>
                        <Row className="g-2 align-items-end">
                            <Col md={8} lg={6}>
                                <Form.Label>Email du client</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="client@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Col>
                            <Col md="auto">
                                <Button type="submit" className="hotel-btn">
                                    Rechercher
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {loading && (
                <div className="text-center py-3">
                    <Spinner animation="border" className="hotel-color" />
                </div>
            )}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && profile && (
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Card.Title className="h6 mb-3">Fiche client</Card.Title>
                        <Row>
                            <Col md={6}>
                                <div className="small text-secondary">Nom complet</div>
                                <div className="fw-semibold">{profile.fullName}</div>
                            </Col>
                            <Col md={6}>
                                <div className="small text-secondary">Email</div>
                                <div className="fw-semibold">{profile.email}</div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {!loading && !error && bookings.length > 0 && (
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        <Card.Title className="h6 mb-3">Historique des séjours</Card.Title>
                        <p className="small text-secondary">
                            {bookings.length} réservation(s) trouvée(s) | {past.length} passée(s) |{" "}
                            {upcoming.length} à venir/en cours
                        </p>
                        <div className="table-responsive">
                            <Table hover size="sm" className="mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Arrivée</th>
                                        <th>Départ</th>
                                        <th>Invités</th>
                                        <th>Chambre</th>
                                        <th>Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortBookingsByCheckInDesc(bookings).map((b) => (
                                        <tr key={b.id}>
                                            <td>{b.id}</td>
                                            <td>{b.checkInDate}</td>
                                            <td>{b.checkOutDate}</td>
                                            <td>{b.totalNumOfGuest}</td>
                                            <td>{b.room?.roomType ?? "—"}</td>
                                            <td>
                                                <code className="small">{b.bookingConfirmationCode}</code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {!loading && !error && normalizedEmail && bookings.length === 0 && (
                <Alert variant="info">Aucun historique trouvé pour cet email.</Alert>
            )}
        </div>
    );
};

export default ReceptionClientHistory;
