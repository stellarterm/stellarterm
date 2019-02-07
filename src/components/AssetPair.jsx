import React from 'react';
import PropTypes from 'prop-types';
import Stellarify from '../lib/Stellarify';
import AssetCard2 from './AssetCard2';

const images = require('./../images');


export default class AssetPair extends React.Component {

    swap() {
        window.location = `#${Stellarify.pairToExchangeUrl(this.props.counterSelling, this.props.baseBuying)}`;
    }

    render() {
        const { baseBuying, counterSelling, row } = this.props || {};

        let baseCard;
        if (baseBuying) {
            baseCard = (<AssetCard2 code={baseBuying.getCode()} issuer={baseBuying.getIssuer()} />);
        }

        let counterCard;
        if (counterSelling) {
            counterCard = (<AssetCard2 code={counterSelling.getCode()} issuer={counterSelling.getIssuer()} />);
        }

        const content = (
            <div className="AssetPair">
                <div className="AssetPair__card">
                    {baseCard}
                </div>

                <div className="AssetPair__separator">
                    <div className="AssetPair__swap" onClick={() => this.swap()}>
                        <img src={images.swap} alt="swap" width="25" height="25" />
                    </div>
                </div>

                <div className="AssetPair__card">
                  {counterCard}
                </div>
            </div>
        );

        if (!row) {
            return content;
        }

        if (baseBuying && counterSelling) {
            const url = `#${Stellarify.pairToExchangeUrl(baseBuying, counterSelling)}`;
            // In the future, this can be split into AssetPairRow and AssetPair if the row is not needed
            return (
               <a href={url} key={url} className="AssetPairRow">{content}</a>
            );
        }
        return (
            <div className="AssetPairRow">{content}</div>
        );
    }
}
AssetPair.propTypes = {
    baseBuying: PropTypes.objectOf(PropTypes.string).isRequired,
    counterSelling: PropTypes.objectOf(PropTypes.string).isRequired,
    row: PropTypes.bool,
};
