import React from "react";
import { Alert, Button, Card } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import moment from "moment";
import Header from "../common/Header";
import { downloadBookingInvoice, printBookingInvoice } from "./bookingPrint";

const BookingSuccess = () => {
    const location = useLocation();
    const error = location.state?.error;
    const booking = location.state?.booking;
    const message =
        location.state?.message ??
        "Réservation confirmée. Merci d’avoir choisi SmartHotelPlus.";

    const canInvoice =
        booking &&
        booking.bookingConfirmationCode &&
        booking.checkInDate &&
        booking.checkOutDate;

    return (
        <div className="container py-4">
            <Header title="Confirmation de réservation" />
            <div className="mt-4">
                {error ? (
                    <Alert variant="danger">
                        <h3 className="h5 mb-2">Échec de réservation</h3>
                        <p className="mb-0">{error}</p>
                    </Alert>
                ) : (
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h3 className="h5 text-success mb-2">Réservation réussie</h3>
                            <p className="mb-3">{message}</p>

                            {booking && (
                                <div className="small text-secondary mb-3">
                                    <div>
                                        <strong>Code :</strong>{" "}
                                        <code>{booking.bookingConfirmationCode}</code>
                                    </div>
                                    <div>
                                        <strong>Client :</strong> {booking.guestFullName} ({booking.guestEmail})
                                    </div>
                                    <div>
                                        <strong>Séjour :</strong> {booking.checkInDate} →{" "}
                                        {booking.checkOutDate} (
                                        {Math.max(
                                            0,
                                            moment(booking.checkOutDate).diff(
                                                moment(booking.checkInDate),
                                                "days"
                                            )
                                        )}{" "}
                                        nuit(s))
                                    </div>
                                    <div>
                                        <strong>Chambre :</strong> {booking.room?.roomType ?? "—"}
                                    </div>
                                </div>
                            )}

                            <div className="d-flex flex-wrap gap-2">
                                {canInvoice && (
                                    <>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => printBookingInvoice(booking)}
                                        >
                                            Imprimer la facture
                                        </Button>
                                        <Button
                                            className="btn-hotel"
                                            onClick={() => downloadBookingInvoice(booking)}
                                        >
                                            Télécharger la facture
                                        </Button>
                                    </>
                                )}
                                <Button as={Link} to="/reservations" variant="dark">
                                    Voir mes réservations
                                </Button>
                                <Button as={Link} to="/browse-all-rooms" variant="outline-dark">
                                    Réserver une autre chambre
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </div>
        </div>
    );
};
export default BookingSuccess;
