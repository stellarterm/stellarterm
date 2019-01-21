import React from 'react';
import PropTypes from 'prop-types';

export default function Generic(props) {
    let header;
    if (props.title) {
        header = (<div className="island__header">{props.title}</div>);
    }
    const containerClassName = props.noTopPadding ? 'so-back islandBack' : 'so-back islandBack islandBack--t';
    return (
        <div className={containerClassName}>
            <div className="island">
                {header}
                <div className="Generic__content">
                    {props.children}
                </div>
            </div>
        </div>
    );
}

Generic.propTypes = {
    title: PropTypes.string,
    noTopPadding: PropTypes.bool,
    children: PropTypes.node,
};
