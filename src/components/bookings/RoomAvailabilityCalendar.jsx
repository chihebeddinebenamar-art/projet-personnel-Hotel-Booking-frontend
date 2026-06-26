import React, { useMemo, useState } from "react";
import moment from "moment";
import {
    isNightOccupiedByRanges,
    rangeConflictsWithBookings,
} from "./bookingDateUtils";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const RoomAvailabilityCalendar = ({
    occupiedRanges = [],
    checkIn,
    checkOut,
    onSelectDates,
    onInvalidRange,
}) => {
    const [cursor, setCursor] = useState(() => moment().startOf("month"));

    const weeks = useMemo(() => {
        const start = cursor.clone().startOf("month");
        const end = cursor.clone().endOf("month");
        const gridStart = start.clone().startOf("isoWeek");
        const gridEnd = end.clone().endOf("isoWeek");
        const rows = [];
        let d = gridStart.clone();
        while (d.isSameOrBefore(gridEnd, "day")) {
            const row = [];
            for (let i = 0; i < 7; i++) {
                row.push(d.clone());
                d.add(1, "day");
            }
            rows.push(row);
        }
        return rows;
    }, [cursor]);

    const today = moment().startOf("day");
    const selIn = checkIn ? moment(checkIn).startOf("day") : null;
    const selOut = checkOut ? moment(checkOut).startOf("day") : null;

    const handleDayClick = (day) => {
        const d = day.clone().startOf("day");
        if (d.isBefore(today)) return;
        if (isNightOccupiedByRanges(d, occupiedRanges)) return;

        if (!selIn || (selIn && selOut)) {
            onSelectDates({ checkIn: d.format("YYYY-MM-DD"), checkOut: "" });
            return;
        }
        if (d.isSameOrBefore(selIn, "day")) {
            onSelectDates({ checkIn: d.format("YYYY-MM-DD"), checkOut: "" });
            return;
        }
        const proposedOut = d.format("YYYY-MM-DD");
        if (rangeConflictsWithBookings(selIn.format("YYYY-MM-DD"), proposedOut, occupiedRanges)) {
            if (onInvalidRange) onInvalidRange();
            return;
        }
        onSelectDates({ checkIn: selIn.format("YYYY-MM-DD"), checkOut: proposedOut });
    };

    const inRangePreview = (day) => {
        if (!selIn || !selOut) return false;
        const d = day.clone().startOf("day");
        return d.isSameOrAfter(selIn, "day") && d.isBefore(selOut, "day");
    };

    return (
        <div className="border rounded-3 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setCursor((c) => c.clone().subtract(1, "month"))}
                >
                    ‹
                </button>
                <span className="fw-semibold text-capitalize">
                    {cursor.format("MMMM YYYY")}
                </span>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setCursor((c) => c.clone().add(1, "month"))}
                >
                    ›
                </button>
            </div>
            <div
                className="d-grid gap-1 text-center small"
                style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
            >
                {WEEKDAYS.map((w) => (
                    <div key={w} className="text-muted py-1">
                        {w}
                    </div>
                ))}
                {weeks.map((row, ri) =>
                    row.map((day, di) => {
                        const inMonth = day.month() === cursor.month();
                        const past = day.isBefore(today, "day");
                        const occupied = isNightOccupiedByRanges(day, occupiedRanges);
                        const isSelIn = selIn && day.isSame(selIn, "day");
                        const isSelOut = selOut && day.isSame(selOut, "day");
                        const inSel = inRangePreview(day);
                        let cls = "rounded py-2 ";
                        if (!inMonth) cls += "text-transparent user-select-none";
                        else if (past) cls += "text-muted bg-light";
                        else if (occupied) cls += "bg-warning text-dark fw-medium";
                        else cls += "cursor-pointer ";
                        if (isSelIn || isSelOut) cls += " btn-hotel text-white fw-bold";
                        else if (inSel && !occupied) cls += " bg-success bg-opacity-15 border border-success border-opacity-50";

                        return (
                            <button
                                key={`${ri}-${di}`}
                                type="button"
                                className={cls + " border-0"}
                                style={{ minHeight: "36px" }}
                                disabled={!inMonth || past || occupied}
                                onClick={() => handleDayClick(day)}
                            >
                                {inMonth ? day.date() : "·"}
                            </button>
                        );
                    })
                )}
            </div>
            <p className="small text-muted mt-3 mb-0">
                <span className="d-inline-block me-2 rounded bg-warning px-2 py-1 text-dark">
                    Déjà réservé
                </span>
                <span className="d-inline-block me-2 rounded border border-success border-opacity-50 bg-success bg-opacity-10 px-2 py-1">
                    Votre sélection
                </span>
                Arrivée puis départ : chaque nuit en jaune est occupée — impossible d&apos;y réserver à
                nouveau. Le jour de départ n&apos;est pas une nuitée (libéré le matin).
            </p>
        </div>
    );
};

export default RoomAvailabilityCalendar;
