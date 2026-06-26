import React, { useEffect, useState, useCallback } from "react";
import { Card, Form, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import moment from "moment";
import {
    getRoomReviews,
    createRoomReview,
    getApiErrorMessage,
} from "../utils/ApiFunctions";
import { useAuth } from "../../hooks/useAuth";

function Stars({ value, size = "1rem" }) {
    const full = Math.round(value);
    return (
        <span className="text-warning" style={{ fontSize: size }} aria-hidden>
            {"★".repeat(full)}
            {"☆".repeat(Math.max(0, 5 - full))}
        </span>
    );
}

const RoomReviews = ({ roomId }) => {
    const { isLoggedIn, isClient, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getRoomReviews(roomId);
            setPage(data);
        } catch (e) {
            setError(getApiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [roomId, token]);

    useEffect(() => {
        load();
    }, [load]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSubmitting(true);
        try {
            await createRoomReview(roomId, {
                rating: parseInt(rating, 10),
                comment: comment.trim() || undefined,
            });
            setComment("");
            await load();
        } catch (err) {
            setFormError(getApiErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-3">
                <Spinner animation="border" size="sm" className="hotel-color" />
                <span className="ms-2 text-secondary small">Chargement des avis…</span>
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    const reviews = page?.reviews ?? [];
    const avg = page?.averageRating;
    const count = page?.count ?? 0;
    const hasReviewed = page?.currentUserHasReviewed === true;
    const canPost = isLoggedIn && isClient && !hasReviewed;

    return (
        <Card className="border-0 shadow-sm">
            <Card.Body>
                <h3 className="h5 mb-3">Avis clients</h3>
                {count > 0 ? (
                    <p className="mb-3">
                        <Stars value={avg} />
                        <span className="ms-2 fw-semibold">
                            {avg != null ? avg.toFixed(1) : "—"} / 5
                        </span>
                        <span className="text-secondary small ms-2">
                            ({count === 1 ? "1 avis" : `${count} avis`})
                        </span>
                    </p>
                ) : (
                    <p className="text-muted small mb-3">Aucun avis pour le moment.</p>
                )}

                <div className="d-flex flex-column gap-3">
                    {reviews.map((r) => (
                        <div key={r.id} className="border-bottom border-light pb-3">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                <strong className="small">{r.authorLabel}</strong>
                                <span className="text-muted small">
                                    {r.createdAt
                                        ? moment(r.createdAt).format("D MMM YYYY")
                                        : ""}
                                </span>
                            </div>
                            <div className="mt-1">
                                <Stars value={r.rating} size="0.9rem" />
                            </div>
                            {r.comment && (
                                <p className="small mb-0 mt-2 text-secondary">{r.comment}</p>
                            )}
                        </div>
                    ))}
                </div>

                {canPost && (
                    <Form className="mt-4" onSubmit={handleSubmit}>
                        <p className="small fw-semibold mb-2">Laisser un avis</p>
                        <Form.Group className="mb-2">
                            <Form.Label className="small">Note</Form.Label>
                            <Form.Select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                disabled={submitting}
                            >
                                {[5, 4, 3, 2, 1].map((n) => (
                                    <option key={n} value={n}>
                                        {n} — {n === 1 ? "étoile" : "étoiles"}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label className="small">Commentaire (optionnel)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                maxLength={2000}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={submitting}
                                placeholder="Votre expérience dans cette chambre…"
                            />
                        </Form.Group>
                        {formError && (
                            <Alert variant="danger" className="py-2 small">
                                {formError}
                            </Alert>
                        )}
                        <Button
                            type="submit"
                            className="btn-hotel"
                            size="sm"
                            disabled={submitting}
                        >
                            {submitting ? "Envoi…" : "Publier mon avis"}
                        </Button>
                    </Form>
                )}

                {!isLoggedIn && (
                    <p className="small text-muted mt-3 mb-0">
                        <Link to="/login">Connectez-vous</Link> pour publier un avis (compte
                        client).
                    </p>
                )}

                {isLoggedIn && !isClient && (
                    <p className="small text-muted mt-3 mb-0">
                        Seuls les comptes clients peuvent publier un avis sur cette chambre.
                    </p>
                )}

                {isLoggedIn && isClient && hasReviewed && (
                    <p className="small text-success mt-3 mb-0">
                        Vous avez déjà publié un avis pour cette chambre. Merci !
                    </p>
                )}
            </Card.Body>
        </Card>
    );
};

export default RoomReviews;
