
import React, { useEffect, useState } from "react"
import { getRoomTypes, getApiErrorMessage } from "../utils/ApiFunctions";

const RoomTypeSelector = ({ handleRoomInputChange, newRoom }) => {
    const [roomTypes, setRoomTypes] = useState([])
    const [loadError, setLoadError] = useState("")

    useEffect(() => {
        getRoomTypes()
            .then((data) => {
                setRoomTypes(Array.isArray(data) ? data : [])
            })
            .catch((err) => {
                setLoadError(getApiErrorMessage(err))
            })
    }, [])

    return (
        <>
            {loadError && (
                <p className="text-danger small">{loadError}</p>
            )}
            {roomTypes.length > 0 && (
            <div>
                <select
                id='roomType'
                className="form-select"
                 name="roomType"
                 value={newRoom.roomType}
                 onChange={handleRoomInputChange}
                 required
                >
                    <option value="">Choisir un type de chambre</option>
                    {roomTypes.map((t) => (
                    <option key={t.id} value={t.name}>
                        {t.name} — jusqu&apos;à {t.maxOccupancy} personne{t.maxOccupancy > 1 ? "s" : ""}
                    </option>
                    ))}
                 </select>
            </div>
            )}
            {roomTypes.length === 0 && !loadError && (
                <p className="text-muted small">
                    Aucun type disponible. L&apos;admin doit en créer dans Types de chambres.
                </p>
            )}
        </>
    )
}
export default RoomTypeSelector
