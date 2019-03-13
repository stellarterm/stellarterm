import React from 'react';
import PropTypes from 'prop-types';

import images from '../../../../images';

export default function LoginPageTabs(props) {
    return (
        <div className="LoginPage__sidebar">
            <a
                className={`LoginPage__sidebar__tab${props.rootAddress === 'signup' ? ' is-active' : ''}`}
                href="#signup">
                New account
            </a>

            <a
                className={`LoginPage__sidebar__tab${props.rootAddress === 'account' ? ' is-active' : ''}`}
                href="#account">
                Log in with key
            </a>

            <a
                className={`LoginPage__sidebar__tab${props.rootAddress === 'ledger' ? ' is-active' : ''}`}
                href="#ledger">
                <img
                    className="LoginPage__sidebar__tab__img--invertible img--noSelect"
                    src={images['ledger-logo']}
                    alt="Ledger"
                    width="75"
                    height="20" />
            </a>
        </div>
    );
}

LoginPageTabs.propTypes = {
    rootAddress: PropTypes.string.isRequired,
};
