import React from 'react';
import PropTypes from 'prop-types';

export default class ManageOffers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: true,
        };
    }

    getRowItems() {
        const { ready } = this.state;
        const { price, baseAmount, counterAmount } = this.props.rectifiedOffer;

        const cancelLink = ready ?
            <a onClick={e => this.handleCancel(e)}>Cancel offer</a> :
            <span>Cancelling...</span>;

        const rowItems = [price, baseAmount, counterAmount, cancelLink];
        if (this.props.invert) {
            rowItems.reverse();
        }

        return (
            rowItems.map(item => (
                <td className="ManageOffers__table__row__item" key={item}>{item}</td>
            ))
        );
    }

    async handleCancel(event) {
        event.preventDefault();

        const { handlers } = this.props.d.session;
        const { rectifiedOffer } = this.props;

        const signAndSubmit = await handlers.removeOffer(rectifiedOffer.id);

        if (signAndSubmit.status !== 'finish') { return; }

        this.setState({ ready: false });

        try {
            await signAndSubmit.serverResult;
        } catch (error) {
            console.error('Errored when cancelling offer', error);
            this.setState({ ready: 'true' });
        }
    }

    render() {
        return (
            <tr className="ManageOffers__table__row">
                {this.getRowItems()}
            </tr>
        );
    }
}
ManageOffers.propTypes = {
    invert: PropTypes.bool,
    rectifiedOffer: PropTypes.shape({
        price: PropTypes.string,
        baseAmount: PropTypes.string,
        counterAmount: PropTypes.string,
    }),
};

