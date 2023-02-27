import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../images';


const SortIcon = ({ sortAlias, currentSort, direction }) => {
    if (sortAlias !== currentSort) {
        return <img src={images['sort-arrow']} alt="sortBy" />;
    }

    return (
        <img
            src={images['sort-arrow-act']}
            alt="sortBy"
            className={direction}
        />
    );
};

SortIcon.propTypes = {
    sortAlias: PropTypes.string.isRequired,
    currentSort: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
};

export default SortIcon;
