import React, { useMemo, useState } from "react"

const RoomFilter = ({ data = [], onFilterChange }) => {
    const [filter, setFilter] = useState("")

    const roomTypes = useMemo(
        () => [...new Set((data ?? []).map((room) => room.roomType).filter(Boolean))],
        [data]
    )

    const handleSelectChange = (e) => {
        const selectedRoomType = e.target.value
        setFilter(selectedRoomType)
        onFilterChange?.(selectedRoomType)
    }

    const clearFilter = () => {
        setFilter("")
        onFilterChange?.("")
    }

    return (
        <div className="input-group">
            <span className="input-group-text bg-white" id="room-type-filter">
                Type
            </span>
            <select className="form-select" value={filter} onChange={handleSelectChange} aria-labelledby="room-type-filter">
                <option value="">Tous les types</option>
                {roomTypes.map((type, index) => (
                    <option key={index} value={String(type)}>
                        {String(type)}
                    </option>
                ))}
            </select>

            <button className="btn btn-outline-secondary" type="button" onClick={clearFilter}>
                Réinitialiser
            </button>
        </div>
    )

}

export default RoomFilter;
