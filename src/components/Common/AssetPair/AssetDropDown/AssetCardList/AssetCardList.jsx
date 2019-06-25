import React from 'react';
import PropTypes from 'prop-types';
import AssetCard2 from '../../../AssetCard2/AssetCard2';
import Driver from '../../../../../lib/Driver';

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
        const { assetsList, activeCardIndex, d, host } = this.props;

        const rows = assetsList.map((asset, index) => {
            const currency = {};
            currency.image = asset.image;
            return (
                <div
                    className="AssetCardList_card"
                    key={asset.code + asset.issuer}
                    ref={index === activeCardIndex ? (node) => {
                        this.activeRef = node;
                    } : null}
                    onClick={() => this.handleChoose(asset)}>
                        <AssetCard2
                            d={d}
                            code={asset.code}
                            issuer={asset.issuer}
                            host={host}
                            currency={currency.image ? currency : null}
                            boxy
                            noborder={index !== activeCardIndex} />
                </div>
            );
        });

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
    d: PropTypes.instanceOf(Driver).isRequired,
    host: PropTypes.string,
    onUpdate: PropTypes.func,
    activeCardIndex: PropTypes.number,
    assetsList: PropTypes.arrayOf(PropTypes.object),
};
