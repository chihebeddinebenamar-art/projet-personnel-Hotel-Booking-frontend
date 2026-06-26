import React from "react";

const RoomPaginator = ({ totalPages, onPageChange, currentPage }) => {
    if (!totalPages || totalPages < 2) {
        return null;
    }
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav aria-label="Pagination des chambres" className="mt-4">
            <ul className="pagination justify-content-center mb-0 flex-wrap">
                {pages.map((page) => (
                    <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                    >
                        <button
                            type="button"
                            className="page-link"
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default RoomPaginator;
