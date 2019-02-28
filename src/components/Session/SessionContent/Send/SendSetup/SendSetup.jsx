import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/Driver';
import SendDest from './Step1/SendDest';
import SendAsset from './Step2/SendAsset';
import SendAmount from './Step3/SendAmount';
import SendReview from './Step4/SendReview';

export default class SendSetup extends React.Component {
    constructor(props) {
        super(props);
        this.listenId = this.props.d.send.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.props.d.send.event.unlisten(this.listenId);
    }

    render() {
        const { d } = this.props;
        const { step } = d.send;

        return (
            <div className="island">
                <div className="island__header">Send payment</div>
                <SendDest d={d} isCurrentStep={step === 1} stepIsPassed={step > 1} />
                <div className="Send__separator" />
                <SendAsset d={d} isCurrentStep={step === 2} stepIsPassed={step > 2} />
                <div className="Send__separator" />
                <SendAmount d={d} isCurrentStep={step === 3} stepIsPassed={step > 3} />
                <div className="Send__separator" />
                <SendReview d={d} isCurrentStep={step === 4} />
            </div>
        );
    }
}

SendSetup.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
