import axios from "axios";

/** Backend : en dev sans `.env`, URL relative + proxy Vite (évite CORS). Sinon URL explicite ou prod. */
const fromEnv = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const API_BASE =
    fromEnv !== undefined && fromEnv !== ""
        ? fromEnv
        : import.meta.env.DEV
          ? ""
          : "http://localhost:8080";

export const api = axios.create({
    baseURL: API_BASE,
});

/** Inscription client (rôle CLIENT) — renvoie { token, email, role, message }. */
export async function registerClient(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
}

/** Profil utilisateur connecté (JWT). */
export async function getMyProfile() {
    const { data } = await api.get("/api/me");
    return data;
}

/** Mise à jour du profil — renvoie un nouveau `token` si l’email a changé. */
export async function updateMyProfile(payload) {
    const { data } = await api.put("/api/me", payload);
    return data;
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function getApiErrorMessage(error) {
    if (!error) return "Erreur inconnue";
    const status = error.response?.status;
    if (status === 401) {
        return "Session expirée ou non connecté. Reconnectez-vous.";
    }
    if (status === 403) {
        return "Action non autorisée pour votre compte.";
    }
    const data = error.response?.data;
    if (data !== undefined && data !== null) {
        if (typeof data === "string" && data.trim()) return data;
        if (typeof data === "object" && data.message) return String(data.message);
    }
    return error.message || "Une erreur est survenue";
}

/** Retourne la chambre créée ({ id, roomType, roomPrice, … }) ou null si échec. */
export async function addRoom(photo, roomNumber, roomType, roomPrice) {
    const formData = new FormData();
    formData.append("photo", photo);
    formData.append("roomNumber", roomNumber);
    formData.append("roomType", roomType);
    formData.append("roomPrice", String(roomPrice));

    const response = await api.post("/rooms/add/new-room", formData);
    if (response.status === 201) return response.data;
    return null;
}

/** Catalogue des types (id, name, maxOccupancy) — GET public */
export async function getRoomTypes() {
    const { data } = await api.get("/api/room-types");
    return data;
}

export async function createRoomType(payload) {
    const { data } = await api.post("/api/room-types", payload);
    return data;
}

export async function updateRoomType(id, payload) {
    const { data } = await api.put(`/api/room-types/${id}`, payload);
    return data;
}

export async function deleteRoomType(id) {
    await api.delete(`/api/room-types/${id}`);
}

/** Catalogue des accessoires (id, name, description) — GET public */
export async function getAccessories() {
    const { data } = await api.get("/api/accessories");
    return data;
}

export async function createAccessory(payload) {
    const { data } = await api.post("/api/accessories", payload);
    return data;
}

export async function updateAccessory(id, payload) {
    const { data } = await api.put(`/api/accessories/${id}`, payload);
    return data;
}

export async function deleteAccessory(id) {
    await api.delete(`/api/accessories/${id}`);
}

/** Réceptionnistes — CRUD réservé admin (JWT). */
export async function getReceptionists() {
    const { data } = await api.get("/api/receptionists");
    return data;
}

export async function getReceptionist(id) {
    const { data } = await api.get(`/api/receptionists/${id}`);
    return data;
}

export async function createReceptionist(payload) {
    const { data } = await api.post("/api/receptionists", payload);
    return data;
}

export async function updateReceptionist(id, payload) {
    const { data } = await api.put(`/api/receptionists/${id}`, payload);
    return data;
}

export async function deleteReceptionist(id) {
    await api.delete(`/api/receptionists/${id}`);
}

/** Associe des accessoires à une chambre (remplace la liste). ADMIN + JWT. */
export async function setRoomAccessories(roomId, accessoryIds) {
    const { data } = await api.put(`/rooms/${roomId}/accessories`, {
        accessoryIds: accessoryIds ?? [],
    });
    return data;
}

export async function getAllRooms() {
    const response = await api.get("/rooms/all-rooms");
    return response.data;
}

export async function getRoomById(roomId) {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data;
}

/** Plages déjà réservées pour calendrier — { checkInDate, checkOutDate }[]. */
export async function getRoomOccupiedRanges(roomId) {
    const { data } = await api.get(`/bookings/room/${roomId}/occupied-ranges`);
    return Array.isArray(data) ? data : [];
}

/** { available: boolean } — chambre libre sur [checkIn, checkOut). */
export async function checkRoomAvailability(roomId, checkIn, checkOut) {
    const { data } = await api.get(`/bookings/room/${roomId}/availability`, {
        params: { checkIn, checkOut },
    });
    return data;
}

/**
 * URL backend qui redirige (302) vers la photo principale sur Cloudinary.
 * Préférez {@link roomPhotoSrc} avec l’objet `room` pour utiliser directement `room.photo` (HTTPS).
 */
export function getRoomPhotoUrl(roomId) {
    return `${API_BASE}/rooms/${roomId}/photo`;
}

/**
 * Source d’image pour les listes : URL Cloudinary (`https://…`) ou ancien Base64 dans `room.photo`.
 */
export function roomPhotoSrc(room) {
    if (!room?.photo) return null;
    const p = room.photo;
    if (typeof p === "string" && /^https?:\/\//i.test(p.trim())) {
        return p.trim();
    }
    return `data:image/jpeg;base64,${p}`;
}

export async function deleteRoom(roomId) {
    await api.delete(`/rooms/${roomId}/delete`);
}

export async function updateRoom(roomId, room) {
    const formData = new FormData();
    formData.append("roomNumber", room.roomNumber);
    formData.append("roomType", room.roomType);
    formData.append("roomPrice", String(room.roomPrice));
    if (room.photo instanceof File) {
        formData.append("photo", room.photo);
    }
    return api.put(`/rooms/${roomId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export async function getAllBookings() {
    const { data } = await api.get("/bookings/all-bookings");
    return data;
}

/** Réservations du client connecté (email = JWT). */
export async function getMyBookings() {
    const { data } = await api.get("/bookings/my");
    return data;
}

/** Réception / admin : arrivées, départs et clients présents aujourd’hui. */
export async function getTodayBookings() {
    const { data } = await api.get("/bookings/today");
    return data;
}

/** Réception/admin : planning global des réservations. */
export async function getStaffAllBookings() {
    const { data } = await api.get("/bookings/staff/all");
    return data;
}

/** Réception/admin : détail client + historique des séjours par email. */
export async function getClientHistoryByEmail(email) {
    const { data } = await api.get("/bookings/staff/client-history", {
        params: { email },
    });
    return data;
}

/** Avis d’une chambre : { averageRating, count, currentUserHasReviewed?, reviews }. */
export async function getRoomReviews(roomId) {
    const { data } = await api.get(`/api/room-reviews/room/${roomId}`);
    return data;
}

/** Publier un avis (JWT client). Body : { rating: 1–5, comment? }. */
export async function createRoomReview(roomId, payload) {
    const { data } = await api.post(`/api/room-reviews/room/${roomId}`, payload);
    return data;
}

/** Dashboard admin (KPI + revenu estimé + top types). */
export async function getAdminDashboardStats() {
    const { data } = await api.get("/api/stats/admin-dashboard");
    return data;
}

/** Dashboard réception (opérations du jour). */
export async function getReceptionDashboardStats() {
    const { data } = await api.get("/api/stats/reception-dashboard");
    return data;
}

/** Prépare un paiement Stripe (montant calculé côté serveur). Renvoie { clientSecret, paymentIntentId, amountCents, currency }. */
export async function createBookingPaymentIntent(roomId, checkInDate, checkOutDate) {
    const { data } = await api.post("/api/payments/create-intent", {
        roomId,
        checkInDate,
        checkOutDate,
    });
    return data;
}

export async function bookRoom(roomId, booking) {
    const payload = {
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guestFullName: booking.guestFullName,
        guestEmail: booking.guestEmail,
        numberOfAdults: parseInt(booking.numberOfAdults, 10),
        numberOfChildren: parseInt(booking.numberOfChildren, 10) || 0,
    };
    if (booking.paymentIntentId) {
        payload.paymentIntentId = booking.paymentIntentId;
    }
    const { data } = await api.post(
        `/bookings/room/${roomId}/booking`,
        payload
    );
    return data.confirmationCode;
}

/** Réception/admin : valider l'arrivée du client (jour d'arrivée). */
export async function registerBookingCheckIn(bookingId) {
    const { data } = await api.post(`/bookings/booking/${bookingId}/check-in`);
    return data;
}

/** Réception/admin : valider le départ du client (jour de départ). */
export async function registerBookingCheckOut(bookingId) {
    const { data } = await api.post(`/bookings/booking/${bookingId}/check-out`);
    return data;
}
