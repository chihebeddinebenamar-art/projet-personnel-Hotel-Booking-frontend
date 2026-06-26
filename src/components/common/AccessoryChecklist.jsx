import React from "react";
import { Form } from "react-bootstrap";

/**
 * @param {{ id: number, name: string, description?: string }[]} accessories
 * @param {number[]} selectedIds
 * @param {(ids: number[]) => void} onChange
 */
export default function AccessoryChecklist({
    accessories,
    selectedIds,
    onChange,
    disabled = false,
}) {
    const toggle = (id) => {
        const set = new Set(selectedIds);
        if (set.has(id)) set.delete(id);
        else set.add(id);
        onChange([...set].sort((a, b) => a - b));
    };

    if (!accessories?.length) {
        return (
            <p className="text-muted small mb-0">
                Aucun accessoire dans le catalogue. Créez-en dans le menu « Accessoires ».
            </p>
        );
    }

    return (
        <div className="d-flex flex-column gap-2 border rounded p-3 bg-white">
            {accessories.map((a) => (
                <Form.Check
                    key={a.id}
                    type="checkbox"
                    id={`acc-${a.id}`}
                    label={
                        <span>
                            <span className="fw-medium">{a.name}</span>
                            {a.description ? (
                                <span className="text-secondary small ms-1">
                                    — {a.description}
                                </span>
                            ) : null}
                        </span>
                    }
                    checked={selectedIds.includes(a.id)}
                    onChange={() => toggle(a.id)}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
