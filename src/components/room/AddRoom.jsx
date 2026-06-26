import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { FaArrowLeft, FaSave, FaImage } from "react-icons/fa";
import {
    addRoom,
    getAccessories,
    setRoomAccessories,
    getApiErrorMessage,
} from "../utils/ApiFunctions";
import RoomTypeSelector from "../common/RoomTypeSelector";
import AccessoryChecklist from "../common/AccessoryChecklist";

const AddRoom = () => {
    const navigate = useNavigate();
    const [newRoom, setNewRoom] = React.useState({
        photo: null,
        roomNumber: "",
        roomType: "",
        roomPrice: "",
    });

    const [imagePreview, setImagePreview] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [accessoryCatalog, setAccessoryCatalog] = useState([]);
    const [selectedAccessoryIds, setSelectedAccessoryIds] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getAccessories()
            .then((data) => setAccessoryCatalog(Array.isArray(data) ? data : []))
            .catch(() => setAccessoryCatalog([]));
    }, []);

    const handleRoomInputChange = (e) => {
        const name = e.target.name;
        let value = e.target.value;
        if (name === "roomPrice") {
            if (!isNaN(value) && value !== "") {
                value = parseInt(value, 10);
            } else {
                value = "";
            }
        }
        setNewRoom({
            ...newRoom,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (!selectedImage) return;
        setNewRoom({ ...newRoom, photo: selectedImage });
        setImagePreview(URL.createObjectURL(selectedImage));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage("");
        try {
            const created = await addRoom(
                newRoom.photo,
                newRoom.roomNumber,
                newRoom.roomType,
                newRoom.roomPrice
            );
            if (created && created.id) {
                try {
                    await setRoomAccessories(created.id, selectedAccessoryIds ?? []);
                } catch (accErr) {
                    setErrorMessage(
                        "Chambre créée, mais les accessoires n’ont pas pu être enregistrés : " +
                            getApiErrorMessage(accErr)
                    );
                    setSubmitting(false);
                    return;
                }
                sessionStorage.setItem(
                    "adminFlashSuccess",
                    "La chambre a été ajoutée avec succès."
                );
                navigate("/existing-rooms", { replace: true });
                return;
            }
            setErrorMessage("Échec de l’ajout de la chambre. Réessayez.");
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-room-form mx-auto" style={{ maxWidth: "640px" }}>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <h1 className="h4 mb-1 hotel-color">Nouvelle chambre</h1>
                    <p className="text-secondary small mb-0">
                        Photo, type catalogue, prix et accessoires optionnels.
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
                                value={newRoom.roomNumber}
                                onChange={handleRoomInputChange}
                                placeholder="Ex: 101"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Type de chambre</Form.Label>
                            <RoomTypeSelector
                                handleRoomInputChange={handleRoomInputChange}
                                newRoom={newRoom}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Prix par nuit ($)</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                id="roomPrice"
                                name="roomPrice"
                                value={newRoom.roomPrice}
                                onChange={handleRoomInputChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="d-block">Accessoires (optionnel)</Form.Label>
                            <AccessoryChecklist
                                accessories={accessoryCatalog}
                                selectedIds={selectedAccessoryIds}
                                onChange={setSelectedAccessoryIds}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="d-flex align-items-center gap-2">
                                <FaImage className="hotel-color" />
                                Photo de la chambre
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                id="photo"
                                name="photo"
                                onChange={handleImageChange}
                                required
                            />
                            {imagePreview && (
                                <div className="mt-3 rounded-3 overflow-hidden border bg-light">
                                    <img
                                        src={imagePreview}
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

export default AddRoom;
