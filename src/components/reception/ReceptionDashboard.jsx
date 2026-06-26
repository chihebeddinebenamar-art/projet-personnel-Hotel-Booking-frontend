import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert, ProgressBar } from "react-bootstrap";
import { FaCalendarCheck, FaBed, FaExchangeAlt } from "react-icons/fa";
import { getApiErrorMessage, getReceptionDashboardStats } from "../utils/ApiFunctions";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

function StatCard({ icon, title, value, hint }) {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="hotel-color">{icon}</span>
                    <Card.Title className="h6 mb-0">{title}</Card.Title>
                </div>
                <div className="h4 mb-1">{value}</div>
                {hint && <div className="small text-secondary">{hint}</div>}
            </Card.Body>
        </Card>
    );
}

const ReceptionDashboard = () => {
    const email = localStorage.getItem("userEmail") || "";
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getReceptionDashboardStats();
                if (!cancelled) setStats(data);
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

    const bookingsToday = Number(stats?.bookingsToday ?? 0);
    const checkIns = Number(stats?.checkInsToday ?? 0);
    const checkOuts = Number(stats?.checkOutsToday ?? 0);
    const occupied = Number(stats?.inHouseToday ?? 0);
    const available = Number(stats?.availableRoomsToday ?? 0);
    const occupancy = Number(stats?.occupancyRateToday ?? 0);
    const flowDenominator = bookingsToday > 0 ? bookingsToday : 1;
    const checkInsPct = (checkIns / flowDenominator) * 100;
    const checkOutsPct = (checkOuts / flowDenominator) * 100;

    const occupancyData = [
        { name: "Occupées", value: occupied },
        { name: "Disponibles", value: available },
    ];
    const flowData = [
        { label: "Arrivées", value: checkIns },
        { label: "Départs", value: checkOuts },
    ];

    return (
        <div>
            <h1 className="h3 mb-1 hotel-color">Bienvenue</h1>
            <p className="text-secondary mb-4">
                {email ? (
                    <>
                        Connecté en tant que <strong>{email}</strong>
                    </>
                ) : (
                    "Espace réception"
                )}
            </p>

            {loading && (
                <div className="text-center py-4">
                    <Spinner animation="border" role="status" className="hotel-color" />
                </div>
            )}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && stats && (
                <>
                    <Row className="g-3 mb-4">
                        <Col md={6} xl={3}>
                            <StatCard
                                icon={<FaExchangeAlt />}
                                title="Mouvements du jour"
                                value={bookingsToday}
                                hint={`${checkIns} arrivées / ${checkOuts} départs`}
                            />
                        </Col>
                        <Col md={6} xl={3}>
                            <StatCard
                                icon={<FaBed />}
                                title="Chambres occupées"
                                value={occupied}
                                hint={`${available} disponibles`}
                            />
                        </Col>
                        <Col md={6} xl={3}>
                            <StatCard
                                icon={<FaCalendarCheck />}
                                title="Taux d'occupation"
                                value={`${occupancy.toFixed(1)} %`}
                            />
                        </Col>
                    </Row>

                    <Row className="g-3">
                        <Col lg={5}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title className="h6 mb-3">Occupation du jour</Card.Title>
                                    <div className="d-flex justify-content-between small mb-2">
                                        <span>{occupied} occupées / {occupied + available} total</span>
                                        <strong>{occupancy.toFixed(1)}%</strong>
                                    </div>
                                    <ProgressBar
                                        now={occupancy}
                                        label={`${occupancy.toFixed(1)}%`}
                                        className="mb-3"
                                    />
                                    <div style={{ width: "100%", height: 220 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={occupancyData} dataKey="value" nameKey="name" outerRadius={75}>
                                                    {occupancyData.map((entry) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={entry.name === "Occupées" ? "#198754" : "#dee2e6"}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`${value}`, "Chambres"]} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={7}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title className="h6 mb-3">Répartition des mouvements du jour</Card.Title>
                                    <Row className="mb-3">
                                        <Col md={6}>
                                            <div className="small text-secondary">Arrivées</div>
                                            <div className="fw-semibold">{checkIns} ({checkInsPct.toFixed(1)}%)</div>
                                        </Col>
                                        <Col md={6}>
                                            <div className="small text-secondary">Départs</div>
                                            <div className="fw-semibold">{checkOuts} ({checkOutsPct.toFixed(1)}%)</div>
                                        </Col>
                                    </Row>
                                    <div style={{ width: "100%", height: 230 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={flowData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip />
                                                <Bar dataKey="value" fill="#198754" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default ReceptionDashboard;
