import React, { useEffect, useState, useMemo } from "react";
import { Table, Spinner, Alert, Button } from "react-bootstrap";
import { Navigate, useLocation } from "react-router-dom";
import {
    getAllBookings,
    getMyBookings,
    getTodayBookings,
    getApiErrorMessage,
    registerBookingCheckIn,
    registerBookingCheckOut,
} from "../utils/ApiFunctions";
import { useAuth } from "../../hooks/useAuth";
import { printBookingInvoice } from "./bookingPrint";

function todayIsoDate() {
    return new Date().toISOString().slice(0, 10);
}

/** À venir / en cours : départ ≥ aujourd’hui. Passées : départ &lt; aujourd’hui. */
function partitionClientBookings(list) {
    const t = todayIsoDate();
    const safe = Array.isArray(list) ? list : [];
    const upcoming = safe.filter((b) => b.checkOutDate && b.checkOutDate >= t);
    const past = safe.filter((b) => b.checkOutDate && b.checkOutDate < t);
    upcoming.sort((a, b) => (a.checkInDate || "").localeCompare(b.checkInDate || ""));
    past.sort((a, b) => (b.checkOutDate || "").localeCompare(a.checkOutDate || ""));
    return { upcoming, past };
}

function BookingTableRows({ bookings, variant, onCheckIn, onCheckOut, actionBusyId }) {
    const today = todayIsoDate();
    return bookings.map((b) => (
        <tr key={b.id}>
            <td>{b.id}</td>
            <td>{b.guestFullName}</td>
            <td>{b.guestEmail}</td>
            <td>{b.checkInDate}</td>
            <td>{b.checkOutDate}</td>
            <td>{b.totalNumOfGuest}</td>
            <td>
                <code className="small">{b.bookingConfirmationCode}</code>
            </td>
            <td>{b.room?.roomType ?? "—"}</td>
            {variant === "today" && (
                <td>
                    {b.checkedOut ? (
                        <span className="badge bg-secondary">Parti</span>
                    ) : b.checkedIn ? (
                        <span className="badge bg-success">Arrivé</span>
                    ) : (
                        <span className="badge bg-warning text-dark">En attente</span>
                    )}
                </td>
            )}
            {variant === "today" && (
                <td className="no-print">
                    <div className="d-flex gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant={b.checkedIn ? "success" : "outline-success"}
                            disabled={
                                actionBusyId === b.id ||
                                b.checkedIn ||
                                b.checkInDate !== today
                            }
                            onClick={() => onCheckIn?.(b.id)}
                        >
                            {b.checkedIn ? "Arrivée OK" : "Enregistrer arrivée"}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant={b.checkedOut ? "secondary" : "outline-secondary"}
                            disabled={
                                actionBusyId === b.id ||
                                b.checkedOut ||
                                !b.checkedIn ||
                                b.checkOutDate !== today
                            }
                            onClick={() => onCheckOut?.(b.id)}
                        >
                            {b.checkedOut ? "Départ OK" : "Enregistrer départ"}
                        </Button>
                    </div>
                </td>
            )}
            {variant === "mine" && (
                <td className="no-print">
                    <Button
                        type="button"
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => printBookingInvoice(b)}
                    >
                        Imprimer
                    </Button>
                </td>
            )}
        </tr>
    ));
}

function BookingsTable({
    bookings,
    variant,
    showInvoiceColumn,
    onCheckIn,
    onCheckOut,
    actionBusyId,
}) {
    return (
        <div className="table-responsive shadow-sm rounded">
            <Table hover bordered className="mb-0 bg-white align-middle">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Arrivée</th>
                        <th>Départ</th>
                        <th>Invités</th>
                        <th>Code</th>
                        <th>Chambre</th>
                        {variant === "today" && <th>Statut</th>}
                        {variant === "today" && <th className="no-print">Actions</th>}
                        {showInvoiceColumn && <th className="no-print">Facture</th>}
                    </tr>
                </thead>
                <tbody>
                    <BookingTableRows
                        bookings={bookings}
                        variant={variant}
                        onCheckIn={onCheckIn}
                        onCheckOut={onCheckOut}
                        actionBusyId={actionBusyId}
                    />
                </tbody>
            </Table>
        </div>
    );
}

/**
 * @param {"mine" | "all" | "today"} variant
 */
const BookingsList = ({ variant = "mine" }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionBusyId, setActionBusyId] = useState(null);
    const [todayStatusFilter, setTodayStatusFilter] = useState("all");
    const { isLoggedIn, token } = useAuth();
    const location = useLocation();

    const { upcoming, past } = useMemo(
        () => (variant === "mine" ? partitionClientBookings(bookings) : { upcoming: [], past: [] }),
        [variant, bookings]
    );
    const filteredTodayBookings = useMemo(() => {
        if (variant !== "today") return bookings;
        if (todayStatusFilter === "all") return bookings;
        return bookings.filter((b) => {
            if (todayStatusFilter === "waiting") return !b.checkedIn && !b.checkedOut;
            if (todayStatusFilter === "arrived") return b.checkedIn && !b.checkedOut;
            if (todayStatusFilter === "departed") return b.checkedOut;
            return true;
        });
    }, [variant, bookings, todayStatusFilter]);

    const todayCounts = useMemo(() => {
        if (variant !== "today") return null;
        const total = bookings.length;
        const waiting = bookings.filter((b) => !b.checkedIn && !b.checkedOut).length;
        const arrived = bookings.filter((b) => b.checkedIn && !b.checkedOut).length;
        const departed = bookings.filter((b) => b.checkedOut).length;
        return { total, waiting, arrived, departed };
    }, [variant, bookings]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError("");
            try {
                let data;
                if (variant === "mine") {
                    data = await getMyBookings();
                } else if (variant === "all") {
                    data = await getAllBookings();
                } else {
                    data = await getTodayBookings();
                }
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
    }, [variant, token]);

    const refreshTodayBookings = async () => {
        const data = await getTodayBookings();
        setBookings(Array.isArray(data) ? data : []);
    };

    const handleCheckIn = async (bookingId) => {
        try {
            setActionBusyId(bookingId);
            await registerBookingCheckIn(bookingId);
            await refreshTodayBookings();
        } catch (e) {
            setError(getApiErrorMessage(e));
        } finally {
            setActionBusyId(null);
        }
    };

    const handleCheckOut = async (bookingId) => {
        try {
            setActionBusyId(bookingId);
            await registerBookingCheckOut(bookingId);
            await refreshTodayBookings();
        } catch (e) {
            setError(getApiErrorMessage(e));
        } finally {
            setActionBusyId(null);
        }
    };

    if (variant === "mine" && !isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const title =
        variant === "mine"
            ? "Historique des réservations"
            : variant === "all"
              ? "Toutes les réservations"
              : "Réservations du jour";

    const subtitle =
        variant === "mine"
            ? "Toutes vos réservations liées à l’email de votre compte : séjours à venir ou en cours, puis séjours passés."
            : variant === "all"
              ? "Vue complète réservée aux administrateurs."
              : "Arrivées, départs et clients présents aujourd’hui (réception et administration).";

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status" className="hotel-color" />
                <p className="mt-2 text-secondary">Chargement des réservations…</p>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (variant === "mine") {
        const total = bookings.length;
        return (
            <div className="container py-4">
                <h1 className="h3 mb-2">{title}</h1>
                <p className="text-secondary small mb-2">{subtitle}</p>
                <p className="small text-muted mb-4">
                    {total === 0
                        ? "Aucune réservation enregistrée pour cet email."
                        : `${total} réservation${total > 1 ? "s" : ""} au total.`}{" "}
                    Pensez à utiliser la <strong>même adresse email</strong> que votre compte lors d’une
                    réservation pour qu’elle apparaisse ici.
                </p>

                {total === 0 ? (
                    <p className="text-muted">Vous n’avez pas encore de réservation.</p>
                ) : (
                    <>
                        <section className="mb-5">
                            <h2 className="h5 mb-3 text-body">Séjours à venir et en cours</h2>
                            {upcoming.length === 0 ? (
                                <p className="text-muted small mb-0">Aucun séjour à venir.</p>
                            ) : (
                                <BookingsTable
                                    bookings={upcoming}
                                    variant="mine"
                                    showInvoiceColumn
                                />
                            )}
                        </section>

                        <section>
                            <h2 className="h5 mb-3 text-body">Historique (séjours passés)</h2>
                            {past.length === 0 ? (
                                <p className="text-muted small mb-0">Aucun séjour passé.</p>
                            ) : (
                                <BookingsTable bookings={past} variant="mine" showInvoiceColumn />
                            )}
                        </section>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h1 className="h3 mb-2">{title}</h1>
            <p className="text-secondary small mb-4">{subtitle}</p>
            {variant === "today" && todayCounts && (
                <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <span className="small text-secondary">Filtrer par statut</span>
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 180 }}
                            value={todayStatusFilter}
                            onChange={(e) => setTodayStatusFilter(e.target.value)}
                        >
                            <option value="all">Tous ({todayCounts.total})</option>
                            <option value="waiting">En attente ({todayCounts.waiting})</option>
                            <option value="arrived">Arrivé ({todayCounts.arrived})</option>
                            <option value="departed">Parti ({todayCounts.departed})</option>
                        </select>
                    </div>
                </div>
            )}
            {(variant === "today" ? filteredTodayBookings.length === 0 : bookings.length === 0) ? (
                <p className="text-muted">Aucune réservation à afficher.</p>
            ) : (
                <BookingsTable
                    bookings={variant === "today" ? filteredTodayBookings : bookings}
                    variant={variant}
                    showInvoiceColumn={false}
                    onCheckIn={variant === "today" ? handleCheckIn : undefined}
                    onCheckOut={variant === "today" ? handleCheckOut : undefined}
                    actionBusyId={actionBusyId}
                />
            )}
        </div>
    );
};

export default BookingsList;
