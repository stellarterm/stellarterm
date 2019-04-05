import React from 'react';
import PropTypes from 'prop-types';

import AssetCard2 from './AssetCard2';


export default class AssetCardList extends React.Component {

    componentDidUpdate() {
        this.scrollToMyRef();
    }

    scrollToMyRef() {
        if (this.activeRef) {
            this.activeRef.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    handleChoose(asset) {
        this.props.onUpdate(asset);
    }

    render() {
        const { assetsList, activeCardIndex } = this.props;

        const rows = assetsList.map((asset, index) => (
            <div
                className="AssetCardList_card"
                key={asset.id}
                ref={index === activeCardIndex ? (node) => { this.activeRef = node; } : null}
                onClick={() => this.handleChoose(asset)}>
                <AssetCard2 code={asset.code} issuer={asset.issuer} boxy noborder={index !== activeCardIndex} />
            </div>
        ));

        return (
            <div className="AssetCardList">
                {rows.length ?
                    rows :
                    <span className="AssetCardList_empty">Asset not found. Use custom pairs selector.</span>
                }
            </div>
        );
    }
}
AssetCardList.propTypes = {
    onUpdate: PropTypes.func,
    activeCardIndex: PropTypes.number,
    assetsList: PropTypes.arrayOf(PropTypes.object),
};
