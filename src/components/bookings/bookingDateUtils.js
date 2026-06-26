import moment from "moment";

/**
 * Nuit réservée : jour d dans [checkIn, checkOut) (aligné backend).
 */
export function isNightOccupiedByRanges(dayMoment, occupiedRanges) {
    const d = dayMoment.clone().startOf("day");
    return occupiedRanges.some((r) => {
        const cin = moment(r.checkInDate).startOf("day");
        const cout = moment(r.checkOutDate).startOf("day");
        return d.isSameOrAfter(cin) && d.isBefore(cout);
    });
}

export function rangeConflictsWithBookings(checkIn, checkOut, occupiedRanges) {
    if (!checkIn || !checkOut) return false;
    const aIn = moment(checkIn).startOf("day");
    const aOut = moment(checkOut).startOf("day");
    if (!aOut.isAfter(aIn)) return true;
    return occupiedRanges.some((r) => {
        const bIn = moment(r.checkInDate).startOf("day");
        const bOut = moment(r.checkOutDate).startOf("day");
        return aIn.isBefore(bOut) && bIn.isBefore(aOut);
    });
}

/**
 * Valide arrivée / départ : au moins 1 nuit, pas de nuit déjà réservée, pas de chevauchement.
 */
export function validateStayDates(checkInStr, checkOutStr, occupiedRanges) {
    if (!checkInStr || !checkOutStr) return "";
    const ci = moment(checkInStr);
    const co = moment(checkOutStr);
    if (!ci.isValid() || !co.isValid()) return "Dates invalides.";
    if (isNightOccupiedByRanges(ci, occupiedRanges)) {
        return "Cette date d’arrivée tombe sur une nuit déjà réservée (choisissez un autre jour d’entrée).";
    }
    if (!co.isAfter(ci, "day")) {
        return "Le départ doit être strictement après l’arrivée (minimum une nuit).";
    }
    if (rangeConflictsWithBookings(checkInStr, checkOutStr, occupiedRanges)) {
        return "Cette période chevauche une réservation existante.";
    }
    return "";
}
