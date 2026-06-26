import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import {
    getRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    getApiErrorMessage,
} from "../utils/ApiFunctions";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const emptyForm = { name: "", maxOccupancy: 2 };

const RoomTypesAdmin = () => {
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setError("");
        try {
            const data = await getRoomTypes();
            setTypes(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(getApiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (t) => {
        setEditingId(t.id);
        setForm({ name: t.name, maxOccupancy: t.maxOccupancy });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const payload = {
                name: form.name.trim(),
                maxOccupancy: parseInt(form.maxOccupancy, 10) || 1,
            };
            if (editingId) {
                await updateRoomType(editingId, payload);
                setSuccess("Type modifié.");
            } else {
                await createRoomType(payload);
                setSuccess("Type ajouté.");
            }
            setShowModal(false);
            await load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (t) => {
        if (
            !window.confirm(
                `Supprimer le type « ${t.name} » ? (Impossible si des chambres l’utilisent encore.)`
            )
        ) {
            return;
        }
        setError("");
        setSuccess("");
        try {
            await deleteRoomType(t.id);
            setSuccess("Type supprimé.");
            await load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" className="hotel-color" />
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                <div>
                    <h1 className="h4 mb-1">Types de chambres</h1>
                    <p className="text-secondary small mb-0">
                        Chaque type indique le nombre maximum de personnes accueillies. Ces types
                        sont proposés lors de la création ou modification d&apos;une chambre.
                    </p>
                </div>
                <Button className="btn btn-hotel" onClick={openCreate}>
                    <FaPlus className="me-2" />
                    Ajouter un type
                </Button>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success" role="alert">
                    {success}
                </div>
            )}

            <div className="table-responsive bg-white shadow-sm rounded">
                <Table hover className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Nom du type</th>
                            <th>Capacité (personnes)</th>
                            <th style={{ width: "140px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {types.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center text-muted py-4">
                                    Aucun type. Ajoutez-en un.
                                </td>
                            </tr>
                        ) : (
                            types.map((t) => (
                                <tr key={t.id}>
                                    <td>{t.id}</td>
                                    <td className="fw-medium">{t.name}</td>
                                    <td>
                                        <span className="badge bg-secondary">
                                            {t.maxOccupancy} pers. max
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-1"
                                            onClick={() => openEdit(t)}
                                            title="Modifier"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(t)}
                                            title="Supprimer"
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingId ? "Modifier le type" : "Nouveau type de chambre"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom du type</Form.Label>
                            <Form.Control
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, name: e.target.value }))
                                }
                                placeholder="ex. Deluxe, Suite…"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Nombre maximum de personnes</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                required
                                value={form.maxOccupancy}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        maxOccupancy: e.target.value,
                                    }))
                                }
                            />
                            <Form.Text className="text-muted">
                                Capacité maximale pour ce type de chambre.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" className="btn-hotel" disabled={saving}>
                            {saving ? "Enregistrement…" : "Enregistrer"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default RoomTypesAdmin;
