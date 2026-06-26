import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import {
    getAccessories,
    createAccessory,
    updateAccessory,
    deleteAccessory,
    getApiErrorMessage,
} from "../utils/ApiFunctions";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const emptyForm = { name: "", description: "" };

const AccessoriesAdmin = () => {
    const [items, setItems] = useState([]);
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
            const data = await getAccessories();
            setItems(Array.isArray(data) ? data : []);
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

    const openEdit = (a) => {
        setEditingId(a.id);
        setForm({
            name: a.name ?? "",
            description: a.description ?? "",
        });
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
                description: form.description?.trim() || null,
            };
            if (editingId) {
                await updateAccessory(editingId, payload);
                setSuccess("Accessoire modifié.");
            } else {
                await createAccessory(payload);
                setSuccess("Accessoire ajouté.");
            }
            setShowModal(false);
            await load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (a) => {
        if (
            !window.confirm(
                `Supprimer « ${a.name} » ? (Impossible si une chambre l’utilise encore.)`
            )
        ) {
            return;
        }
        setError("");
        setSuccess("");
        try {
            await deleteAccessory(a.id);
            setSuccess("Accessoire supprimé.");
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
                    <h1 className="h4 mb-1">Accessoires</h1>
                    <p className="text-secondary small mb-0">
                        Wi‑Fi, TV, minibar, etc. Vous les associez ensuite à chaque chambre depuis
                        l’ajout ou la modification d’une chambre.
                    </p>
                </div>
                <Button className="btn btn-hotel" onClick={openCreate}>
                    <FaPlus className="me-2" />
                    Ajouter un accessoire
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
                            <th>Nom</th>
                            <th>Description</th>
                            <th style={{ width: "140px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center text-muted py-4">
                                    Aucun accessoire. Ajoutez-en un.
                                </td>
                            </tr>
                        ) : (
                            items.map((a) => (
                                <tr key={a.id}>
                                    <td>{a.id}</td>
                                    <td className="fw-medium">{a.name}</td>
                                    <td className="text-secondary small">
                                        {a.description || "—"}
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-1"
                                            onClick={() => openEdit(a)}
                                            title="Modifier"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(a)}
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
                        {editingId ? "Modifier l’accessoire" : "Nouvel accessoire"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, name: e.target.value }))
                                }
                                placeholder="ex. Wi‑Fi, Climatisation…"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description (optionnelle)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={form.description}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Courte précision pour le catalogue"
                            />
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

export default AccessoriesAdmin;
