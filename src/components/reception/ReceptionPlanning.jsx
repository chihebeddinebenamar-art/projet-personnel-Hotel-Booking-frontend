import React, { useEffect, useMemo, useState } from "react";
import { Alert, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { getApiErrorMessage, getStaffAllBookings } from "../utils/ApiFunctions";

function toIso(d) {
    return d.toISOString().slice(0, 10);
}

const ReceptionPlanning = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fromDate, setFromDate] = useState(toIso(new Date()));
    const [toDate, setToDate] = useState(toIso(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)));

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getStaffAllBookings();
                if (!cancelled) setBookings(Array.isArray(data) ? data : []);
            } catch (e) {
                if (!cancelled) setError(getApiErrorMessage(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(() => {
        const safe = Array.isArray(bookings) ? bookings : [];
        const from = fromDate || "0000-01-01";
        const to = toDate || "9999-12-31";
        return safe
            .filter((b) => (b.checkInDate || "") <= to && (b.checkOutDate || "") >= from)
            .sort((a, b) => (a.checkInDate || "").localeCompare(b.checkInDate || ""));
    }, [bookings, fromDate, toDate]);

    return (
        <div>
            <h1 className="h3 mb-2">Planning global des réservations</h1>
            <p className="text-secondary mb-4">
                Vue consolidée des séjours sur une période (arrivées, départs, chambre, client).
            </p>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Label>Du</Form.Label>
                            <Form.Control
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Au</Form.Label>
                            <Form.Control
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </Col>
                        <Col md={4} className="d-flex align-items-end">
                            <div className="small text-secondary">
                                Résultats: <strong>{filtered.length}</strong>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading && (
                <div className="text-center py-3">
                    <Spinner animation="border" className="hotel-color" />
                </div>
            )}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && (
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        {filtered.length === 0 ? (
                            <p className="text-muted mb-0">Aucune réservation sur cette période.</p>
                        ) : (
                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Client</th>
                                            <th>Email</th>
                                            <th>Arrivée</th>
                                            <th>Départ</th>
                                            <th>Invités</th>
                                            <th>Chambre</th>
                                            <th>Code</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((b) => (
                                            <tr key={b.id}>
                                                <td>{b.id}</td>
                                                <td>{b.guestFullName}</td>
                                                <td>{b.guestEmail}</td>
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
                        )}
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default ReceptionPlanning;
