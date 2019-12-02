import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import AssetList from '../Common/AssetList/AssetList';
import ErrorBoundary from '../Common/ErrorBoundary/ErrorBoundary';
import CustomPairMenu from './CustomPairMenu/CustomPairMenu';
import CustomMarketPicker from './CustomMarketPicker/CustomMarketPicker';
import SearchByAnchor from '../Common/SearchByAnchor/SearchByAnchor';

export default class Markets extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            zeroAssetsVisible: false,
        };
    }

    render() {
        const { d } = this.props;
        const { zeroAssetsVisible } = this.state;

        return (
            <div>
                <ErrorBoundary>
                    <div className="so-back islandBack islandBack--t">
                        <SearchByAnchor d={d} tradeLink />
                    </div>
                </ErrorBoundary>

                <div className="so-back islandBack">
                    <div className="island">
                        <div className="AssetList_Header">
                            <div className="ListHeader_Title">Markets overview</div>
                            <div
                                className="ListHeader_lowTradable"
                                onClick={() => this.setState({ zeroAssetsVisible: !zeroAssetsVisible })}>
                                Include 24h zero volume assets
                                <input
                                    type="checkbox"
                                    readOnly
                                    className="checkbox_lowTradable"
                                    checked={zeroAssetsVisible} />
                            </div>
                        </div>
                        <AssetList d={d} showLowTradable={zeroAssetsVisible} />
                        <div className="AssetListFooter">
                            StellarTerm does not endorse any of these issuers. They are here for informational purposes
                            only.
                            <br />
                            To get listed on StellarTerm,{' '}
                            <a
                                href="https://github.com/stellarterm/stellarterm-directory"
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
                        <CustomPairMenu d={d} />
                    </div>
                    <div className="so-back islandBack">
                        <CustomMarketPicker row d={d} />
                    </div>
                </ErrorBoundary>
            </div>
        );
    }
}

Markets.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
