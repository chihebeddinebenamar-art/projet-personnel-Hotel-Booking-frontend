import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert, Table, ProgressBar } from "react-bootstrap";
import {
    FaCalendarCheck,
    FaUserFriends,
    FaEuroSign,
    FaBed,
} from "react-icons/fa";
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
import { getAdminDashboardStats, getApiErrorMessage } from "../utils/ApiFunctions";

function KpiCard({ icon, label, value, hint }) {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
                <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="hotel-color">{icon}</span>
                    <Card.Title className="h6 mb-0">{label}</Card.Title>
                </div>
                <div className="h4 mb-1">{value}</div>
                {hint && <div className="small text-secondary">{hint}</div>}
            </Card.Body>
        </Card>
    );
}

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getAdminDashboardStats();
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

    const topRoomTypes = Array.isArray(stats?.topRoomTypes) ? stats.topRoomTypes : [];
    const occupied = Number(stats?.inHouseToday ?? 0);
    const available = Math.max(0, Number(stats?.totalRooms ?? 0) - occupied);
    const occupancy = Number(stats?.occupancyRateToday ?? 0);

    const occupancyData = [
        { name: "Occupées", value: occupied },
        { name: "Disponibles", value: available },
    ];

    const topRoomTypesData = topRoomTypes.map((r) => ({
        roomType: r.roomType,
        bookings: Number(r.bookings ?? 0),
    }));

    const PIE_COLORS = ["#0d6efd", "#e9ecef"];

    return (
        <div>
            <h1 className="h3 mb-1">Tableau de bord</h1>
            <p className="text-secondary mb-4">
                Vue temps réel de l'activité hôtel.
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
                            <KpiCard
                                icon={<FaBed />}
                                label="Chambres"
                                value={stats.totalRooms ?? 0}
                                hint={`Occupées aujourd'hui : ${stats.inHouseToday ?? 0}`}
                            />
                        </Col>
                        <Col md={6} xl={3}>
                            <KpiCard
                                icon={<FaCalendarCheck />}
                                label="Réservations"
                                value={stats.totalBookings ?? 0}
                                hint={`Arrivées aujourd'hui : ${stats.checkInsToday ?? 0}`}
                            />
                        </Col>
                        <Col md={6} xl={3}>
                            <KpiCard
                                icon={<FaUserFriends />}
                                label="Comptes"
                                value={`${stats.totalClients ?? 0} clients`}
                                hint={`${stats.totalReceptionists ?? 0} réceptionnistes`}
                            />
                        </Col>
                        <Col md={6} xl={3}>
                            <KpiCard
                                icon={<FaEuroSign />}
                                label="Revenu estimé (mois)"
                                value={`${Number(stats.estimatedRevenueCurrentMonth ?? 0).toFixed(2)} €`}
                                hint={`Prix moyen: ${Number(stats.averageRoomPrice ?? 0).toFixed(2)} €`}
                            />
                        </Col>
                    </Row>

                    <Row className="g-3 mb-4">
                        <Col md={6} xl={3}>
                            <KpiCard
                                icon={<FaCalendarCheck />}
                                label="Mouvements du jour"
                                value={stats.bookingsToday ?? 0}
                                hint={`${stats.checkInsToday ?? 0} arrivées / ${stats.checkOutsToday ?? 0} départs`}
                            />
                        </Col>
                        <Col md={6} xl={3}>
                            <KpiCard
                                icon={<FaBed />}
                                label="Taux d'occupation"
                                value={`${Number(stats.occupancyRateToday ?? 0).toFixed(1)} %`}
                                hint="Basé sur les chambres occupées aujourd'hui"
                            />
                        </Col>
                    </Row>

                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body>
                            <Card.Title className="h6 mb-3">Top types de chambres (réservations)</Card.Title>
                            {topRoomTypes.length === 0 ? (
                                <p className="small text-secondary mb-0">Pas encore de données.</p>
                            ) : (
                                <Table responsive hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Réservations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topRoomTypes.map((r) => (
                                            <tr key={r.roomType}>
                                                <td>{r.roomType}</td>
                                                <td>{r.bookings}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>

                    <Row className="g-3">
                        <Col lg={5}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body>
                                    <Card.Title className="h6 mb-3">Occupation aujourd'hui</Card.Title>
                                    <div className="d-flex justify-content-between small mb-2">
                                        <span>{occupied} occupées / {Number(stats.totalRooms ?? 0)} total</span>
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
                                                <Pie
                                                    data={occupancyData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={45}
                                                    outerRadius={75}
                                                    paddingAngle={2}
                                                >
                                                    {occupancyData.map((entry) => (
                                                        <Cell
                                                            key={entry.name}
                                                            fill={entry.name === "Occupées" ? PIE_COLORS[0] : PIE_COLORS[1]}
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
                                    <Card.Title className="h6 mb-3">Réservations par type de chambre</Card.Title>
                                    <div style={{ width: "100%", height: 260 }}>
                                        {topRoomTypesData.length === 0 ? (
                                            <p className="small text-secondary mb-0">Pas encore de données.</p>
                                        ) : (
                                            <ResponsiveContainer>
                                                <BarChart data={topRoomTypesData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="roomType" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Bar dataKey="bookings" fill="#0d6efd" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
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

export default AdminDashboard;
