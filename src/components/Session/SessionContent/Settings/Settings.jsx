import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import PreferredHorizon from './PreferredHorizon/PreferredHorizon';


const Settings = ({ d }) => (
    <div className="so-back islandBack islandBack--t">
        <PreferredHorizon d={d} />
    </div>
);

Settings.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};

export default Settings;
