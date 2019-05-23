import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import AssetList from '../Common/AssetList/AssetList';
import ErrorBoundary from '../Common/ErrorBoundary/ErrorBoundary';
import CustomPairMenu from './CustomPairMenu/CustomPairMenu';
import CustomMarketPicker from './CustomMarketPicker/CustomMarketPicker';
import AddTrustFromFederation from '../Session/SessionContent/Trust/AddTrustFromFederation/AddTrustFromFederation';

export default function Markets(props) {
    return (
        <div>
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <AssetList d={props.d} />
                    <div className="AssetListFooter">
                        StellarTerm does not endorse any of these issuers. They are here for informational purposes
                        only.
                        <br />
                        To get listed on StellarTerm,{' '}
                        <a
                            href="https://github.com/stellarterm/stellarterm/tree/master/directory"
                            target="_blank"
                            rel="nofollow noopener noreferrer">
                            please read the instructions on GitHub
                        </a>
                        .
                    </div>
                </div>
            </div>

            <ErrorBoundary>
                <div className="so-back islandBack">
                    <AddTrustFromFederation d={props.d} tradeLink />
                </div>
                <div className="so-back islandBack">
                    <CustomPairMenu d={props.d} />
                </div>
                <div className="so-back islandBack">
                    <CustomMarketPicker row d={props.d} />
                </div>
            </ErrorBoundary>
        </div>
    );
}

Markets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
