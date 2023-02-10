import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import images from '../../../images';


const PAGES_CONTROLS_COUNT = 3;

const getVisiblePages = (pages, currentPage) => {
    if (pages.length <= PAGES_CONTROLS_COUNT) {
        return pages;
    }

    if (currentPage === 1) {
        return pages.slice(0, PAGES_CONTROLS_COUNT);
    }

    if (currentPage === pages.length) {
        return pages.slice(-PAGES_CONTROLS_COUNT);
    }

    return pages.slice(currentPage - 2, (currentPage - 2) + PAGES_CONTROLS_COUNT);
};

const Pagination = ({
    pageSize,
    totalCount,
    onPageChange,
    currentPage,
    itemName,
}) => {
    const [page, setPage] = useState(currentPage);
    const currentItems = `${((page - 1) * pageSize) + 1} - ${
        page * pageSize > totalCount ? totalCount : page * pageSize
    }`;

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    const pages = useMemo(() => {
        const pagesCount = Math.ceil(totalCount / pageSize);
        return Array.from(Array(pagesCount), (_, i) => i + 1);
    }, [totalCount, pageSize]);

    if (totalCount <= pageSize) {
        return null;
    }

    const visiblePages = getVisiblePages(pages, page);

    const onPageClick = clickedPage => {
        if (page !== clickedPage) {
            onPageChange(clickedPage);
        }
    };

    const nextPage = () => {
        if (page !== pages.length) {
            onPageChange(page + 1);
        }
    };

    const prevPage = () => {
        if (page !== 1) {
            onPageChange(page - 1);
        }
    };

    return (
        <div className="Pagination">
            <div className="Pagination_state">
                <b>{currentItems}</b> of <b>{totalCount}</b>{' '}
                {itemName}
            </div>
            <div className="Pagination_controls">
                <img src={images['icon-arrow-right-pagination']} className="Pagination_arrow left" alt="<" onClick={() => prevPage()} />
                {visiblePages.map(pageItem => (
                    <div
                        className={`Pagination_page ${page === pageItem ? 'active' : ''}`}
                        key={pageItem}
                        onClick={() => onPageClick(pageItem)}
                    >
                        {pageItem}
                    </div>
                ))}
                <img src={images['icon-arrow-right-pagination']} className="Pagination_arrow" alt=">" onClick={() => nextPage()} />
            </div>
        </div>
    );
};

Pagination.propTypes = {
    pageSize: PropTypes.number,
    totalCount: PropTypes.number,
    onPageChange: PropTypes.func,
    currentPage: PropTypes.number,
    itemName: PropTypes.string,
};

export default Pagination;
