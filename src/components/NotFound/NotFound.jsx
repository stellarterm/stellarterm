import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Generic from '../Common/Generic/Generic';
import images from '../../images';

export default function NotFound(props) {
    const { pageName, withoutWrapper } = props;

    let image404;
    let titleText;
    let description404;

    switch (pageName) {
    case 'exchange':
        image404 = <img src={images['icon-pairNotFound']} alt="not-found" />;
        titleText = 'Market pair not found';
        description404 = (
            <p>
                    Exchange pair was not found on the ledger. Check the selected assets
                    or <Link to="/markets/">choose another pair.</Link>
            </p>
        );
        break;
    case 'markets' :
        image404 = <img src={images['icon-notFound']} alt="not-found" />;
        titleText = 'Base asset not found';
        description404 = (
            <p>
                Base asset was not found. Check the selected asset or choose another asset.
            </p>
        );
        break;
    default:
        image404 = <img src={images['icon-notFound']} alt="not-found" />;
        titleText = 'Page not found';
        description404 = <p>This page does not exist or was recently moved. Go to <Link to="/">Home page.</Link></p>;
    }

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
    pageName: PropTypes.string,
    withoutWrapper: PropTypes.bool,
};
