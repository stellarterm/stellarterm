import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import images from '../../../../images';

export default function LoginPageTabs(props) {
    return (
        <div className="LoginPage__sidebar">
            <Link
                className={`LoginPage__sidebar__tab${props.rootAddress === 'signup' ? ' is-active' : ''}`}
                to="/signup">
                New account
            </Link>

            <Link
                className={`LoginPage__sidebar__tab${props.rootAddress === 'account' ? ' is-active' : ''}`}
                to="/account/">
                Log in with key
            </Link>

            <Link
                className={`LoginPage__sidebar__tab${props.rootAddress === 'ledger' ? ' is-active' : ''}`}
                to="/ledger">
                <img
                    className="LoginPage__sidebar__tab__img--invertible img--noSelect"
                    src={images['ledger-logo']}
                    alt="Ledger"
                    width="75"
                    height="20" />
            </Link>
        </div>
    );
}

LoginPageTabs.propTypes = {
    rootAddress: PropTypes.string.isRequired,
};
