import React from 'react';
import PropTypes from 'prop-types';
import Ellipsis from '../Common/Ellipsis/Ellipsis';


const AppLoading = ({ text }) => (
    <div className="so-back islandBack islandBack--t">
        <div className="island">
            <div className="directory-loading-block">
                <div className="directory-loader">
                    <div className="nk-spinner" />
                </div>
                <div>
                    {text}
                    <Ellipsis />
                </div>

            </div>
        </div>
    </div>
);

AppLoading.propTypes = {
    text: PropTypes.string.isRequired,
};

export default AppLoading;

