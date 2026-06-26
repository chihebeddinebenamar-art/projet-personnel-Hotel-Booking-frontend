import React, { useEffect, useState } from "react";
import { Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import {
    getReceptionists,
    createReceptionist,
    updateReceptionist,
    deleteReceptionist,
    getApiErrorMessage,
} from "../utils/ApiFunctions";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const emptyForm = {
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    telephone: "",
};

const ReceptionistsAdmin = () => {
    const [list, setList] = useState([]);
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
            const data = await getReceptionists();
            setList(Array.isArray(data) ? data : []);
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

    const openEdit = (r) => {
        setEditingId(r.id);
        setForm({
            nom: r.nom ?? "",
            prenom: r.prenom ?? "",
            email: r.email ?? "",
            motDePasse: "",
            telephone: r.telephone ?? "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const base = {
                nom: form.nom.trim(),
                prenom: form.prenom.trim(),
                email: form.email.trim(),
                telephone: form.telephone?.trim() || "",
            };
            if (editingId) {
                const payload = { ...base };
                if (form.motDePasse?.trim()) {
                    payload.motDePasse = form.motDePasse;
                }
                await updateReceptionist(editingId, payload);
                setSuccess("Réceptionniste modifié.");
            } else {
                await createReceptionist({
                    ...base,
                    motDePasse: form.motDePasse,
                });
                setSuccess("Réceptionniste créé. Il peut se connecter avec cet email et le mot de passe défini.");
            }
            setShowModal(false);
            await load();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (r) => {
        if (
            !window.confirm(
                `Supprimer ${r.prenom} ${r.nom} ? Il ne pourra plus se connecter.`
            )
        ) {
            return;
        }
        setError("");
        setSuccess("");
        try {
            await deleteReceptionist(r.id);
            setSuccess("Compte supprimé.");
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
                    <h1 className="h4 mb-1">Réceptionnistes</h1>
                    <p className="text-secondary small mb-0">
                        Créez des comptes : nom, prénom, email, téléphone et mot de passe. Ils se
                        connectent depuis la page de connexion (rôle réception).
                    </p>
                </div>
                <Button className="btn btn-hotel" onClick={openCreate}>
                    <FaPlus className="me-2" />
                    Nouveau réceptionniste
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
                            <th>Prénom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th style={{ width: "120px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center text-muted py-4">
                                    Aucun réceptionniste. Ajoutez-en un.
                                </td>
                            </tr>
                        ) : (
                            list.map((r) => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td className="fw-medium">{r.nom}</td>
                                    <td>{r.prenom}</td>
                                    <td>{r.email}</td>
                                    <td>{r.telephone || "—"}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-1"
                                            onClick={() => openEdit(r)}
                                            title="Modifier"
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(r)}
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

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingId ? "Modifier le réceptionniste" : "Nouveau réceptionniste"}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Nom</Form.Label>
                                    <Form.Control
                                        required
                                        value={form.nom}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, nom: e.target.value }))
                                        }
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Prénom</Form.Label>
                                    <Form.Control
                                        required
                                        value={form.prenom}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, prenom: e.target.value }))
                                        }
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Email (connexion)</Form.Label>
                                    <Form.Control
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={form.email}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, email: e.target.value }))
                                        }
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Téléphone</Form.Label>
                                    <Form.Control
                                        value={form.telephone}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, telephone: e.target.value }))
                                        }
                                        placeholder="+216 …"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label>
                                        Mot de passe
                                        {editingId && (
                                            <span className="text-secondary fw-normal small">
                                                {" "}
                                                (laisser vide pour ne pas changer)
                                            </span>
                                        )}
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        autoComplete="new-password"
                                        required={!editingId}
                                        value={form.motDePasse}
                                        onChange={(e) =>
                                            setForm((f) => ({ ...f, motDePasse: e.target.value }))
                                        }
                                        minLength={editingId ? 0 : 6}
                                    />
                                    {!editingId && (
                                        <Form.Text className="text-muted">
                                            Minimum 6 caractères — utilisé pour la première connexion.
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </div>
                        </div>
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

export default ReceptionistsAdmin;
