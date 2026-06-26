import moment from "moment";
import { useState, useEffect, useMemo } from "react";
import { Button, Spinner, Alert } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
    createBookingPaymentIntent,
    getApiErrorMessage,
} from "../utils/ApiFunctions";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

function StripePaymentBlock({ amountLabel, onPaid }) {
    const stripe = useStripe();
    const elements = useElements();
    const [err, setErr] = useState("");
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setBusy(true);
        setErr("");
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });
        setBusy(false);
        if (error) {
            setErr(error.message || "Paiement refusé.");
            return;
        }
        if (paymentIntent?.status === "succeeded" && paymentIntent.id) {
            await onPaid(paymentIntent.id);
        } else {
            setErr("Le paiement n’a pas pu être confirmé.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="border rounded-3 p-3 bg-light">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>
            <Button
                type="submit"
                variant="success"
                className="mt-3 w-100 btn-hotel border-0"
                disabled={!stripe || busy}
            >
                {busy ? (
                    <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Paiement en cours…
                    </>
                ) : (
                    `Payer ${amountLabel} et confirmer la réservation`
                )}
            </Button>
            {err && (
                <Alert variant="danger" className="mt-2 small mb-0">
                    {err}
                </Alert>
            )}
        </form>
    );
}

const BookingSummary = ({ roomId, booking, payment, onConfirm }) => {
    const numberOfDays = moment(booking.checkOutDate).diff(
        moment(booking.checkInDate),
        "days"
    );
    const [intentLoading, setIntentLoading] = useState(true);
    const [intentError, setIntentError] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    /** Serveur sans clé secrète Stripe : réservation possible sans encaissement (dev). */
    const [stripeOffOnServer, setStripeOffOnServer] = useState(false);
    const [legacyBusy, setLegacyBusy] = useState(false);

    const stripePromise = useMemo(
        () => (publishableKey ? loadStripe(publishableKey) : null),
        []
    );

    useEffect(() => {
        let cancelled = false;
        if (!roomId || !booking.checkInDate || !booking.checkOutDate) {
            setIntentLoading(false);
            return;
        }
        setIntentLoading(true);
        setIntentError("");
        setClientSecret("");
        setStripeOffOnServer(false);
        createBookingPaymentIntent(roomId, booking.checkInDate, booking.checkOutDate)
            .then((data) => {
                if (cancelled || !data?.clientSecret) return;
                setClientSecret(data.clientSecret);
            })
            .catch((e) => {
                const msg = getApiErrorMessage(e);
                if (cancelled) return;
                const low = msg.toLowerCase();
                if (
                    low.includes("non configuré") ||
                    low.includes("stripe non configuré") ||
                    low.includes("clé secrète manquante")
                ) {
                    setStripeOffOnServer(true);
                } else {
                    setIntentError(msg);
                }
            })
            .finally(() => {
                if (!cancelled) setIntentLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [roomId, booking.checkInDate, booking.checkOutDate]);

    const handlePaid = async (paymentIntentId) => {
        await onConfirm(paymentIntentId);
    };

    const handleLegacy = async () => {
        setLegacyBusy(true);
        try {
            await onConfirm();
        } finally {
            setLegacyBusy(false);
        }
    };

    const amountStr = `${payment.toFixed(2)} €`;

    const showStripe =
        clientSecret &&
        stripePromise &&
        publishableKey &&
        !stripeOffOnServer;

    return (
        <div className="card card-body mt-4 border shadow-sm">
            <h4 className="h5 mb-3">Récapitulatif</h4>
            <p>
                Nom : <strong>{booking.guestFullName}</strong>
            </p>
            <p>
                Email : <strong>{booking.guestEmail}</strong>
            </p>
            <p>
                Arrivée :{" "}
                <strong>{moment(booking.checkInDate).format("DD MMM YYYY")}</strong>
            </p>
            <p>
                Départ :{" "}
                <strong>{moment(booking.checkOutDate).format("DD MMM YYYY")}</strong>
            </p>
            <p>
                Nuits : <strong>{numberOfDays}</strong>
            </p>
            <p>
                Adultes : <strong>{booking.numberOfAdults}</strong>
            </p>
            <p>
                Enfants : <strong>{booking.numberOfChildren || 0}</strong>
            </p>

            <div className="mb-3">
                <h5 className="fs-6">Voyageurs</h5>
                <strong>
                    Adulte{parseInt(booking.numberOfAdults, 10) > 1 ? "s" : ""} :{" "}
                    {booking.numberOfAdults}{" "}
                </strong>
                <strong> · Enfants : {booking.numberOfChildren || 0}</strong>
            </div>

            {payment > 0 ? (
                <>
                    <p className="mb-2">
                        Total à payer : <strong>{amountStr}</strong>
                    </p>
                    <p className="small text-muted">
                        Paiement sécurisé par Stripe (carte de test : 4242 4242 4242 4242, date
                        future, CVC quelconque).
                    </p>

                    {intentLoading && (
                        <p className="text-muted small mb-0">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Préparation du paiement…
                        </p>
                    )}

                    {!intentLoading && intentError && (
                        <Alert variant="danger" className="small">
                            {intentError}
                        </Alert>
                    )}

                    {!intentLoading && stripeOffOnServer && (
                        <>
                            <Alert variant="info" className="small">
                                Stripe n’est pas configuré côté serveur (aucune clé secrète). Vous
                                pouvez quand même enregistrer la réservation sans encaissement.
                            </Alert>
                            <Button
                                variant="success"
                                className="btn-hotel border-0"
                                onClick={handleLegacy}
                                disabled={legacyBusy}
                            >
                                {legacyBusy ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Envoi…
                                    </>
                                ) : (
                                    "Confirmer la réservation (sans paiement)"
                                )}
                            </Button>
                        </>
                    )}

                    {!intentLoading && !publishableKey && !stripeOffOnServer && (
                        <Alert variant="warning" className="small">
                            Définissez <code>VITE_STRIPE_PUBLISHABLE_KEY</code> dans le fichier{" "}
                            <code>.env</code> du frontend (clé publique Stripe).
                        </Alert>
                    )}

                    {showStripe && (
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                locale: "fr",
                                appearance: { theme: "stripe" },
                            }}
                        >
                            <StripePaymentBlock amountLabel={amountStr} onPaid={handlePaid} />
                        </Elements>
                    )}
                </>
            ) : (
                <p className="text-danger">
                    Les dates ne sont pas valides (la sortie doit être après l&apos;entrée).
                </p>
            )}
        </div>
    );
};
export default BookingSummary;
