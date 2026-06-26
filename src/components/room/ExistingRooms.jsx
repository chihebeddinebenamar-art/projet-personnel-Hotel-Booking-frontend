import React, { useState, useEffect } from "react";
import { Row, Col, Card, Spinner, Table, Badge, Button } from "react-bootstrap";
import { deleteRoom, getAllRooms, roomPhotoSrc } from "../utils/ApiFunctions";
import RoomFilter from "../common/RoomFilter";
import RoomPaginator from "../common/RoomPaginator";
import { FaTrashAlt, FaPlus, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

const ExistingRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [roomsPerPage] = useState(8);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedRoomType, setSelectedRoomType] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchRooms = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            const result = await getAllRooms();
            const list = Array.isArray(result) ? result : [];
            setRooms(list);
            setFilteredRooms(list);
        } catch (error) {
            setErrorMessage(error.message || "Impossible de charger les chambres.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const flash = sessionStorage.getItem("adminFlashSuccess");
        if (flash) {
            setSuccessMessage(flash);
            sessionStorage.removeItem("adminFlashSuccess");
            const t = setTimeout(() => setSuccessMessage(""), 5000);
            return () => clearTimeout(t);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
    }, []);

    useEffect(() => {
        if (selectedRoomType === "") {
            setFilteredRooms(rooms);
        } else {
            setFilteredRooms(
                rooms.filter((room) => room.roomType === selectedRoomType)
            );
        }
        setCurrentPage(1);
    }, [rooms, selectedRoomType]);

    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (roomId) => {
        if (
            !window.confirm(
                `Supprimer la chambre ${rooms.find((r) => r.id === roomId)?.roomNumber || `#${roomId}`} ? Cette action est définitive.`
            )
        ) {
            return;
        }
        try {
            await deleteRoom(roomId);
            setSuccessMessage(`La chambre ${rooms.find((r) => r.id === roomId)?.roomNumber || `#${roomId}`} a été supprimée.`);
            fetchRooms();
        } catch (error) {
            setErrorMessage(error.message || "Échec de la suppression.");
        }
        setTimeout(() => {
            setSuccessMessage("");
            setErrorMessage("");
        }, 4000);
    };

    const calculateTotalPages = (filtered, perPage, all) => {
        const total =
            filtered.length > 0 ? filtered.length : all.length;
        return Math.max(1, Math.ceil(total / perPage));
    };

    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(
        indexOfFirstRoom,
        indexOfLastRoom
    );

    const totalPages = calculateTotalPages(
        filteredRooms,
        roomsPerPage,
        rooms
    );

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" className="hotel-color" role="status">
                    <span className="visually-hidden">Chargement…</span>
                </Spinner>
                <p className="text-secondary mt-3 small mb-0">
                    Chargement des chambres…
                </p>
            </div>
        );
    }

    return (
        <div className="admin-rooms-list">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h1 className="h4 mb-1 hotel-color">Chambres</h1>
                    <p className="text-secondary small mb-0">
                        {rooms.length} chambre{rooms.length !== 1 ? "s" : ""} au
                        total — filtrez par type, modifiez ou supprimez.
                    </p>
                </div>
                <Link
                    to="/add-room"
                    className="btn btn-hotel d-inline-flex align-items-center gap-2"
                >
                    <FaPlus /> Nouvelle chambre
                </Link>
            </div>

            {successMessage && (
                <div className="alert alert-success shadow-sm" role="alert">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="alert alert-danger shadow-sm" role="alert">
                    {errorMessage}
                </div>
            )}

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="py-3">
                    <Row className="align-items-center g-3">
                        <Col xs={12} md={7} lg={6}>
                            <label className="form-label small text-secondary mb-1">
                                Filtrer par type
                            </label>
                            <RoomFilter
                                data={rooms}
                                onFilterChange={setSelectedRoomType}
                            />
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {currentRooms.length === 0 ? (
                <Card className="border-0 shadow-sm text-center py-5">
                    <Card.Body className="text-secondary">
                        <p className="mb-2">Aucune chambre à afficher.</p>
                        <Link to="/add-room" className="btn btn-hotel btn-sm">
                            <FaPlus className="me-1" /> Ajouter une chambre
                        </Link>
                    </Card.Body>
                </Card>
            ) : (
                <>
                    <div className="table-responsive rounded-3 shadow-sm bg-white">
                        <Table
                            hover
                            className="mb-0 align-middle admin-rooms-table"
                        >
                            <thead className="table-light">
                                <tr>
                                    <th scope="col" className="text-center" style={{ width: "88px" }}>
                                        Photo
                                    </th>
                                    <th scope="col">ID</th>
                                    <th scope="col">Numéro</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Prix / nuit</th>
                                    <th scope="col" className="text-end pe-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRooms.map((room) => {
                                    const thumb = roomPhotoSrc(room);
                                    return (
                                        <tr key={room.id}>
                                            <td className="text-center">
                                                {thumb ? (
                                                    <img
                                                        src={thumb}
                                                        alt=""
                                                        className="rounded-2 border"
                                                        style={{
                                                            width: "72px",
                                                            height: "52px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-muted small">—</span>
                                                )}
                                            </td>
                                            <td>
                                                <Badge bg="secondary" className="fw-normal">
                                                    #{room.id}
                                                </Badge>
                                            </td>
                                            <td className="fw-medium">{room.roomNumber || "—"}</td>
                                            <td className="fw-medium">{room.roomType}</td>
                                            <td>
                                                <span className="room-price">
                                                    ${room.roomPrice}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                <div className="d-inline-flex gap-1 flex-wrap justify-content-end">
                                                    <Link to={`/edit-room/${room.id}`}>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center gap-1"
                                                            title="Modifier"
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        title="Supprimer"
                                                        onClick={() => handleDelete(room.id)}
                                                    >
                                                        <FaTrashAlt />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>

                    <RoomPaginator
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePaginationClick}
                    />
                </>
            )}
        </div>
    );
};

export default ExistingRooms;
