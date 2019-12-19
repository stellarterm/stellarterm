import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Generic from '../Common/Generic/Generic';
import images from '../../images';

export default function NotFound(props) {
    const { isExchange404, withoutWrapper } = props;
    const image404 = isExchange404
        ? <img src={images['icon-pairNotFound']} alt="not-found" />
        : <img src={images['icon-notFound']} alt="not-found" />;

    const titleText = isExchange404
        ? 'Market pair not found'
        : 'Page not found';

    const description404 = isExchange404 ? (
        <p>
            Exchange pair was not found on the ledger. Check the selected assets
            or <Link to="/markets/">choose another pair.</Link>
        </p>
    ) : (
        <p>This page does not exist or was recently moved. Go to <Link to="/">Home page.</Link></p>
    );

    const notFoundContent = (
        <div className="notFound-container">
            {image404}
            <h2>{titleText}</h2>
            {description404}
        </div>
    );

    return (
        withoutWrapper ? notFoundContent : <Generic>{notFoundContent}</Generic>
    );
}

NotFound.propTypes = {
    isExchange404: PropTypes.bool,
    withoutWrapper: PropTypes.bool,
};
