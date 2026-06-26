import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaSave, FaImage } from "react-icons/fa";
import {
    updateRoom,
    getRoomById,
    getAccessories,
    setRoomAccessories,
    getRoomPhotoUrl,
    getApiErrorMessage,
    roomPhotoSrc,
} from "../utils/ApiFunctions";
import AccessoryChecklist from "../common/AccessoryChecklist";
import RoomTypeSelector from "../common/RoomTypeSelector";

const EditRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState({
        photo: null,
        roomNumber: "",
        roomType: "",
        roomPrice: "",
    });
    const [accessoryCatalog, setAccessoryCatalog] = useState([]);
    const [selectedAccessoryIds, setSelectedAccessoryIds] = useState([]);
    const [imagePreview, setImagePreview] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getAccessories()
            .then((data) => setAccessoryCatalog(Array.isArray(data) ? data : []))
            .catch(() => setAccessoryCatalog([]));
    }, []);

    useEffect(() => {
        const fetchRoom = async () => {
            setLoading(true);
            setLoadError("");
            try {
                const roomData = await getRoomById(roomId);
                setRoom({
                    photo: null,
                    roomNumber: roomData.roomNumber ?? "",
                    roomType: roomData.roomType ?? "",
                    roomPrice:
                        roomData.roomPrice !== undefined && roomData.roomPrice !== null
                            ? roomData.roomPrice
                            : "",
                });
                const ids = roomData.accessories?.map((a) => a.id) ?? [];
                setSelectedAccessoryIds(ids);
                const main = roomData.photo;
                setImagePreview(
                    typeof main === "string" && /^https?:\/\//i.test(main)
                        ? main
                        : roomPhotoSrc(roomData) || getRoomPhotoUrl(roomId)
                );
            } catch (error) {
                console.error("Error fetching room details:", error);
                setLoadError(
                    getApiErrorMessage(error) || "Impossible de charger la chambre."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [roomId]);

    const handleImageChange = (e) => {
        const selectedImage = e.target.files?.[0];
        if (!selectedImage) return;
        setRoom({ ...room, photo: selectedImage });
        setImagePreview(URL.createObjectURL(selectedImage));
    };

    const handleRoomInputChange = (e) => {
        const { name, value } = e.target;
        let next = value;
        if (name === "roomPrice") {
            if (!isNaN(value) && value !== "") {
                next = parseInt(value, 10);
            } else {
                next = "";
            }
        }
        setRoom({ ...room, [name]: next });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setErrorMessage("");
        try {
            const response = await updateRoom(roomId, room);
            if (response.status === 200) {
                try {
                    await setRoomAccessories(roomId, selectedAccessoryIds);
                } catch (accErr) {
                    setErrorMessage(
                        "Chambre mise à jour, mais les accessoires n’ont pas pu être enregistrés : " +
                            getApiErrorMessage(accErr)
                    );
                    setSubmitting(false);
                    return;
                }
                sessionStorage.setItem(
                    "adminFlashSuccess",
                    "La chambre a été mise à jour avec succès."
                );
                navigate("/existing-rooms", { replace: true });
                return;
            }
            setErrorMessage("Échec de la mise à jour. Réessayez.");
        } catch (error) {
            console.error("Error updating room:", error);
            setErrorMessage(getApiErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" className="hotel-color" role="status">
                    <span className="visually-hidden">Chargement…</span>
                </Spinner>
                <p className="text-secondary mt-3 small mb-0">
                    Chargement de la chambre…
                </p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="mx-auto" style={{ maxWidth: "640px" }}>
                <Alert variant="danger">{loadError}</Alert>
                <Link to="/existing-rooms" className="btn btn-outline-secondary">
                    <FaArrowLeft className="me-2" />
                    Retour à la liste
                </Link>
            </div>
        );
    }

    return (
        <div className="admin-room-form mx-auto" style={{ maxWidth: "640px" }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="h4 mb-1 hotel-color">Modifier la chambre</h1>
                    <p className="text-secondary small mb-0">
                        Chambre n°{roomId} — type catalogue, prix, accessoires et photo
                        optionnelle.
                    </p>
                </div>
                <Link
                    to="/existing-rooms"
                    className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2"
                >
                    <FaArrowLeft /> Liste des chambres
                </Link>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                    {errorMessage && (
                        <Alert variant="danger" className="mb-3">
                            {errorMessage}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Numéro de chambre</Form.Label>
                            <Form.Control
                                type="text"
                                id="roomNumber"
                                name="roomNumber"
                                value={room.roomNumber}
                                onChange={handleRoomInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Type de chambre</Form.Label>
                            <RoomTypeSelector
                                handleRoomInputChange={handleRoomInputChange}
                                newRoom={room}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Prix par nuit ($)</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                id="roomPrice"
                                name="roomPrice"
                                value={room.roomPrice}
                                onChange={handleRoomInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="d-block">Accessoires</Form.Label>
                            <AccessoryChecklist
                                accessories={accessoryCatalog}
                                selectedIds={selectedAccessoryIds}
                                onChange={setSelectedAccessoryIds}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="d-flex align-items-center gap-2">
                                <FaImage className="hotel-color" />
                                Nouvelle photo (optionnel)
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                id="photo"
                                name="photo"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <div className="mt-3 rounded-3 overflow-hidden border bg-light">
                                    <img
                                        src={
                                            imagePreview.startsWith("blob:") ||
                                            imagePreview.startsWith("data:") ||
                                            imagePreview.startsWith("http")
                                                ? imagePreview
                                                : `data:image/jpeg;base64,${imagePreview}`
                                        }
                                        alt="Aperçu"
                                        className="w-100"
                                        style={{
                                            maxHeight: "280px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                            )}
                        </Form.Group>

                        <div className="d-flex flex-wrap gap-2 justify-content-end pt-2 border-top">
                            <Link
                                to="/existing-rooms"
                                className="btn btn-outline-secondary"
                            >
                                Annuler
                            </Link>
                            <Button
                                type="submit"
                                className="btn-hotel d-inline-flex align-items-center gap-2"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Spinner animation="border" size="sm" />
                                        Enregistrement…
                                    </>
                                ) : (
                                    <>
                                        <FaSave /> Enregistrer
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EditRoom;
