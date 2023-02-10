import React from 'react';
import PropTypes from 'prop-types';
import AssetCardMain from '../../../AssetCard/AssetCardMain/AssetCardMain';
import Driver from '../../../../../lib/driver/Driver';
import AssetCardInRow from '../../../AssetCard/AssetCardInRow/AssetCardInRow';

export default class AssetCardList extends React.Component {
    componentDidUpdate(prevProps) {
        if (prevProps.activeCardIndex !== this.props.activeCardIndex) {
            this.scrollToMyRef();
        }
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
        const { assetsList, activeCardIndex, d, compactSize, withEmpty } = this.props;

        const rows = assetsList.map((asset, index) => (
            <div
                className={`AssetCardList_card ${index === activeCardIndex ? 'AssetCardList_card-active' : ''}`}
                key={asset.code + asset.issuer}
                ref={index === activeCardIndex ? node => {
                    this.activeRef = node;
                } : null}
                onClick={() => this.handleChoose(asset)}
            >
                {compactSize ?
                    <AssetCardInRow
                        d={d}
                        code={asset.code}
                        issuer={asset.issuer}
                    /> :
                    <AssetCardMain
                        d={d}
                        code={asset.code}
                        issuer={asset.issuer}
                        boxy
                        noborder={index !== activeCardIndex}
                    />
                }

            </div>
        ));

        return (
            <div className="AssetCardList">
                <div className="AssetCardList_scrollable">
                    {rows.length ?
                        rows :
                        <span className="AssetCardList_empty">
                            {compactSize ?
                                'Asset not found' :
                                'Asset not found. Use custom pairs selector.'
                            }
                        </span>
                    }
                </div>
                {withEmpty &&
                    <div
                        className="AssetCardList_reset"
                        onClick={() => this.handleChoose(null)}
                    >
                        Reset filter
                    </div>
                }
            </div>
        );
    }
}
AssetCardList.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    onUpdate: PropTypes.func,
    activeCardIndex: PropTypes.number,
    assetsList: PropTypes.arrayOf(PropTypes.object),
    compactSize: PropTypes.bool,
    withEmpty: PropTypes.bool,
};
