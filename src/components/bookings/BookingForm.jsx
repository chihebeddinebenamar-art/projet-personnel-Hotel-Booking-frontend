import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import {
    getRoomById,
    getRoomOccupiedRanges,
    bookRoom,
    getApiErrorMessage,
    roomPhotoSrc,
} from "../utils/ApiFunctions";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { FormControl, Form, Spinner } from "react-bootstrap";

const BookingSummary = lazy(() => import("./BookingSummary"));
import RoomAvailabilityCalendar from "./RoomAvailabilityCalendar";
import RoomReviews from "../room/RoomReviews";
import { validateStayDates } from "./bookingDateUtils";

const BookingForm = () => {
    const [isValidated, setIsValidated] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [roomPrice, setRoomPrice] = useState(0);
    const [roomDetail, setRoomDetail] = useState(null);
    const [occupiedRanges, setOccupiedRanges] = useState([]);
    const [loadingRoom, setLoadingRoom] = useState(true);

    const [booking, setBooking] = useState({
        guestFullName: "",
        guestEmail: "",
        checkInDate: "",
        checkOutDate: "",
        numberOfAdults: "1",
        numberOfChildren: "0",
    });

    const { roomId } = useParams();
    const navigate = useNavigate();

    const maxOccupancy = roomDetail?.maxOccupancy;
    /** Si le type n’a pas de max en base, on borne la liste à 10 pour la saisie. */
    const effectiveCap = useMemo(() => {
        return maxOccupancy != null && maxOccupancy > 0 ? maxOccupancy : 10;
    }, [maxOccupancy]);

    const adultOptions = useMemo(() => {
        return Array.from({ length: effectiveCap }, (_, i) => i + 1);
    }, [effectiveCap]);

    const adultsNum = parseInt(booking.numberOfAdults, 10) || 1;
    const maxChildrenAllowed = Math.max(0, effectiveCap - adultsNum);

    const childOptions = useMemo(() => {
        return Array.from({ length: maxChildrenAllowed + 1 }, (_, i) => i);
    }, [maxChildrenAllowed]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBooking({ ...booking, [name]: value });
        setErrorMessage("");
    };

    const handleGuestSelectChange = (e) => {
        const { name, value } = e.target;
        if (name === "numberOfAdults") {
            const a = parseInt(value, 10);
            const prevC = parseInt(booking.numberOfChildren, 10) || 0;
            const maxC = Math.max(0, effectiveCap - a);
            const newC = Math.min(prevC, maxC);
            setBooking({
                ...booking,
                numberOfAdults: value,
                numberOfChildren: String(newC),
            });
        } else {
            setBooking({ ...booking, [name]: value });
        }
        setErrorMessage("");
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        const next = { ...booking, [name]: value };

        if (name === "checkInDate" && value) {
            const ci = moment(value);
            if (next.checkOutDate) {
                const co = moment(next.checkOutDate);
                if (!co.isAfter(ci, "day")) {
                    next.checkOutDate = ci.clone().add(1, "day").format("YYYY-MM-DD");
                }
            }
        }

        setBooking(next);

        const cin = name === "checkInDate" ? value : next.checkInDate;
        const cout = name === "checkOutDate" ? value : next.checkOutDate;
        if (cin && cout) {
            setErrorMessage(validateStayDates(cin, cout, occupiedRanges));
        } else {
            setErrorMessage("");
        }
    };

    const loadRoomData = useCallback(async () => {
        if (!roomId) return;
        setLoadingRoom(true);
        setErrorMessage("");
        try {
            const [room, ranges] = await Promise.all([
                getRoomById(roomId),
                getRoomOccupiedRanges(roomId),
            ]);
            setRoomDetail(room);
            setOccupiedRanges(ranges);
            const price = room.roomPrice;
            setRoomPrice(typeof price === "number" ? price : parseFloat(price) || 0);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error));
        } finally {
            setLoadingRoom(false);
        }
    }, [roomId]);

    useEffect(() => {
        loadRoomData();
    }, [loadRoomData]);

    /** Si le plafond baisse (ex. chargement du max réel), recale le nombre d’enfants. */
    useEffect(() => {
        const c = parseInt(booking.numberOfChildren, 10) || 0;
        if (c > maxChildrenAllowed) {
            setBooking((b) => ({
                ...b,
                numberOfChildren: String(maxChildrenAllowed),
            }));
        }
    }, [maxChildrenAllowed, booking.numberOfChildren]);

    const calculatePayement = () => {
        const checkInDate = moment(booking.checkInDate);
        const checkOutDate = moment(booking.checkOutDate);
        if (!checkInDate.isValid() || !checkOutDate.isValid()) return 0;
        const diffInDays = checkOutDate.diff(checkInDate, "days");
        const price = roomPrice ? roomPrice : 0;
        return Math.max(0, diffInDays) * price;
    };

    const isGuestCountValid = () => {
        const adultCount = parseInt(booking.numberOfAdults, 10);
        const childrenCount = parseInt(booking.numberOfChildren, 10) || 0;
        if (Number.isNaN(adultCount) || adultCount < 1) return false;
        const total = adultCount + childrenCount;
        if (total > effectiveCap) {
            setErrorMessage(
                `Le nombre de personnes (${total}) dépasse la capacité (${effectiveCap}) pour cette saisie.`
            );
            return false;
        }
        return true;
    };

    const isStayDatesValid = () => {
        const msg = validateStayDates(
            booking.checkInDate,
            booking.checkOutDate,
            occupiedRanges
        );
        if (msg) {
            setErrorMessage(msg);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (
            form.checkValidity() === false ||
            !isGuestCountValid() ||
            !isStayDatesValid()
        ) {
            e.stopPropagation();
        } else {
            setIsSubmitted(true);
        }
        setIsValidated(true);
    };

    const handleBooking = async (paymentIntentId) => {
        try {
            const confirmationCode = await bookRoom(roomId, {
                ...booking,
                ...(paymentIntentId ? { paymentIntentId } : {}),
            });
            const adults = parseInt(booking.numberOfAdults, 10) || 0;
            const children = parseInt(booking.numberOfChildren, 10) || 0;
            navigate("/booking-success", {
                state: {
                    message: `Réservation confirmée. Code : ${confirmationCode}`,
                    booking: {
                        bookingConfirmationCode: confirmationCode,
                        guestFullName: booking.guestFullName,
                        guestEmail: booking.guestEmail,
                        checkInDate: booking.checkInDate,
                        checkOutDate: booking.checkOutDate,
                        totalNumOfGuest: adults + children,
                        room: {
                            roomType: roomDetail?.roomType,
                            roomPrice: roomDetail?.roomPrice,
                        },
                    },
                },
            });
        } catch (error) {
            const msg = getApiErrorMessage(error);
            setErrorMessage(msg);
        }
    };

    const onCalendarSelect = ({ checkIn, checkOut }) => {
        setBooking((b) => ({ ...b, checkInDate: checkIn, checkOutDate: checkOut }));
        if (checkIn && checkOut) {
            setErrorMessage(validateStayDates(checkIn, checkOut, occupiedRanges));
        } else {
            setErrorMessage("");
        }
    };

    if (loadingRoom) {
        return (
            <div className="container py-5">
                <p className="text-muted">Chargement de la chambre…</p>
            </div>
        );
    }

    const photo = roomDetail ? roomPhotoSrc(roomDetail) : null;

    return (
        <>
            <div className="container mb-5">
                <div className="row g-4">
                    <div className="col-lg-6">
                        {roomDetail && (
                            <div className="card border-0 shadow-sm overflow-hidden mb-4">
                                {photo && (
                                    <img
                                        src={photo}
                                        alt={roomDetail.roomType}
                                        className="w-100 object-fit-cover"
                                        style={{ maxHeight: "220px" }}
                                    />
                                )}
                                <div className="card-body">
                                    <h2 className="h5 mb-1">{roomDetail.roomType}</h2>
                                    <p className="text-muted small mb-0">
                                        {maxOccupancy != null ? (
                                            <>
                                                Capacité max : <strong>{maxOccupancy}</strong> personne
                                                {maxOccupancy > 1 ? "s" : ""} (listes ci-contre bornées à ce
                                                total).
                                            </>
                                        ) : (
                                            <>
                                                Capacité catalogue non renseignée — sélection bornée à{" "}
                                                <strong>{effectiveCap}</strong> personne
                                                {effectiveCap > 1 ? "s" : ""} par défaut.
                                            </>
                                        )}
                                    </p>
                                    {roomDetail.roomPrice != null && (
                                        <p className="hotel-color fw-semibold mt-2 mb-0">
                                            {Number(roomDetail.roomPrice).toFixed(2)} € / nuit
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="card card-body shadow-sm">
                            <h3 className="h5 mb-3">Calendrier des disponibilités</h3>
                            <p className="small text-muted">
                                Les nuits <strong className="text-dark">en jaune</strong> sont déjà
                                réservées : la chambre ne peut pas être louée deux fois sur la même période.
                                Choisissez une <strong>arrivée</strong> puis un <strong>départ</strong> (les
                                nuits entre les deux sont comptées ; le jour du départ libère la chambre le
                                matin).
                            </p>
                            <RoomAvailabilityCalendar
                                occupiedRanges={occupiedRanges}
                                checkIn={booking.checkInDate}
                                checkOut={booking.checkOutDate}
                                onSelectDates={onCalendarSelect}
                                onInvalidRange={() =>
                                    setErrorMessage(
                                        "Cette période chevauche une réservation existante. Choisissez une autre date de départ."
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="col-lg-6">
                        <div className="card card-body shadow-sm mt-lg-0 mt-2">
                            <h3 className="h5 mb-3">Réserver cette chambre</h3>
                            <Form
                                noValidate
                                validated={isValidated}
                                onSubmit={handleSubmit}
                            >
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="guestFullName">Nom complet</Form.Label>
                                    <FormControl
                                        required
                                        type="text"
                                        id="guestFullName"
                                        name="guestFullName"
                                        value={booking.guestFullName}
                                        placeholder="Prénom et nom"
                                        onChange={handleInputChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Indiquez votre nom complet.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="guestEmail">Email</Form.Label>
                                    <FormControl
                                        required
                                        type="email"
                                        id="guestEmail"
                                        name="guestEmail"
                                        value={booking.guestEmail}
                                        placeholder="vous@exemple.com"
                                        onChange={handleInputChange}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Email invalide.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <fieldset className="mb-3">
                                    <legend className="fs-6 fw-semibold">
                                        Séjour — arrivée et départ
                                    </legend>
                                    <p className="small text-muted mb-2">
                                        Règle : <strong>départ &gt; arrivée</strong> (minimum 1 nuit). Les
                                        intervalles réservés ailleurs sont exclus (comme sur le calendrier).
                                    </p>
                                    <div className="row g-2">
                                        <div className="col-md-6">
                                            <Form.Label htmlFor="checkInDate">Arrivée</Form.Label>
                                            <FormControl
                                                required
                                                type="date"
                                                id="checkInDate"
                                                name="checkInDate"
                                                value={booking.checkInDate}
                                                min={moment().format("YYYY-MM-DD")}
                                                onChange={handleDateChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <Form.Label htmlFor="checkOutDate">Départ</Form.Label>
                                            <FormControl
                                                required
                                                type="date"
                                                id="checkOutDate"
                                                name="checkOutDate"
                                                value={booking.checkOutDate}
                                                min={
                                                    booking.checkInDate
                                                        ? moment(booking.checkInDate)
                                                              .add(1, "day")
                                                              .format("YYYY-MM-DD")
                                                        : moment().format("YYYY-MM-DD")
                                                }
                                                onChange={handleDateChange}
                                            />
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset className="mb-3">
                                    <legend className="fs-6 fw-semibold">Nombre de personnes</legend>
                                    <p className="small text-muted mb-2">
                                        Adultes + enfants ≤ {effectiveCap}
                                        {maxOccupancy != null
                                            ? " (type de chambre)."
                                            : " (plafond par défaut)."}
                                    </p>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <Form.Label htmlFor="numberOfAdults">Adultes</Form.Label>
                                            <Form.Select
                                                id="numberOfAdults"
                                                name="numberOfAdults"
                                                value={booking.numberOfAdults}
                                                onChange={handleGuestSelectChange}
                                            >
                                                {adultOptions.map((a) => (
                                                    <option key={a} value={String(a)}>
                                                        {a} {a > 1 ? "adultes" : "adulte"}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                        <div className="col-6">
                                            <Form.Label htmlFor="numberOfChildren">Enfants</Form.Label>
                                            <Form.Select
                                                id="numberOfChildren"
                                                name="numberOfChildren"
                                                value={booking.numberOfChildren}
                                                onChange={handleGuestSelectChange}
                                            >
                                                {childOptions.map((c) => (
                                                    <option key={c} value={String(c)}>
                                                        {c} {c > 1 ? "enfants" : "enfant"}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </div>
                                    </div>
                                </fieldset>

                                {errorMessage && (
                                    <p className="text-danger small">{errorMessage}</p>
                                )}

                                <button type="submit" className="btn btn-hotel">
                                    Continuer vers le récapitulatif
                                </button>
                            </Form>
                        </div>

                        {isSubmitted && (
                            <Suspense
                                fallback={
                                    <div className="text-center py-4">
                                        <Spinner animation="border" size="sm" className="hotel-color" />
                                        <p className="small text-secondary mt-2">Chargement du paiement…</p>
                                    </div>
                                }
                            >
                                <BookingSummary
                                    roomId={roomId}
                                    booking={booking}
                                    payment={calculatePayement()}
                                    onConfirm={handleBooking}
                                />
                            </Suspense>
                        )}
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-12">
                        <RoomReviews roomId={Number(roomId)} />
                    </div>
                </div>
            </div>
        </>
    );
};
export default BookingForm;
