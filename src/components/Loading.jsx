import React from 'react';
import PropTypes from 'prop-types';

window.React = React;

export default function Loading(props) {
    let loadingClass = 'Loading';
    if (props.size === 'large') {
        loadingClass += ' Loading--large';
    }

    // Use darker for when text contains content that should be legible
    if (props.darker) {
        loadingClass += ' Loading--darker';
    }

    if (props.left) {
        loadingClass += ' Loading--left';
    }

    return (<div className={loadingClass}>
        <p className="Loading__message">{props.children}</p>
    </div>);
}

Loading.propTypes = {
    size: PropTypes.string,
    darker: PropTypes.bool,
    left: PropTypes.bool,
    children: PropTypes.node,
};
