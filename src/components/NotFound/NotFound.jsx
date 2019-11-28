import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Generic from '../Common/Generic/Generic';
import images from '../../images';

export default function NotFound(props) {
    const { isExchange404 } = props;
    const image404 = isExchange404
        ? <img src={images['icon-pairNotFound']} alt="not-found" />
        : <img src={images['icon-notFound']} alt="not-found" />;

    const titleText = isExchange404
        ? "Exchange market doesn't exist!"
        : "Page doesn't exist!";

    const description404 = isExchange404
        ? <p>One or two assets of pair doesn{"'"}t exist. Please, <Link to="/markets/">pick a correct trading pair.</Link></p>
        : <p>Go to the <Link to="/">Home Page</Link> to choose a new direction.</p>;

    return (
        <Generic>
            <div className="notFound-container">
                {image404}
                <h2>{titleText}</h2>
                {description404}
            </div>
        </Generic>
    );
}

NotFound.propTypes = {
    isExchange404: PropTypes.bool,
};
