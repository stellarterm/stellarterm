import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';


export default class OfferMakerSubmit extends React.Component {
    render() {
        const capitalizedSide = this.props.side === 'buy' ? 'Buy' : 'Sell';

        if (this.props.d.session.state === 'out') {
            return (
                <span className="OfferMaker__message">
                    <a href="#account">Log in</a> to create an offer
                </span>
            );
        }

        if (this.props.trustNeeded.length) {
            return null;
        }

        if (this.props.buttonState === 'pending') {
            return (
                <input type="submit" className="s-button" disabled value="Creating offer..." />
            );
        }

        return (
            <input
                type="submit"
                className="s-button"
                value={`${capitalizedSide} ${this.props.assetName}`}
                disabled={!this.props.valid || this.props.insufficient} />
        );
    }
}
OfferMakerSubmit.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    trustNeeded: PropTypes.arrayOf(PropTypes.object),
    insufficient: PropTypes.bool,
    buttonState: PropTypes.string,
    assetName: PropTypes.string,
    valid: PropTypes.bool,
};
