import React from 'react';
import PropTypes from 'prop-types';

import Driver from '../../lib/Driver';
import SendStepReview from './SendStepReview';
import SendStepAmount from './SendStepAmount';
import SendStepAsset from './SendStepAsset';
import SendStepDestination from './SendStepDestination';

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
                <SendStepDestination d={d} isCurrentStep={step === 1} stepIsPassed={step > 1} />
                <div className="Send__separator" />
                <SendStepAsset d={d} isCurrentStep={step === 2} stepIsPassed={step > 2} />
                <div className="Send__separator" />
                <SendStepAmount d={d} isCurrentStep={step === 3} stepIsPassed={step > 3} />
                <div className="Send__separator" />
                <SendStepReview d={d} isCurrentStep={step === 4} />
            </div>
        );
    }
}

SendSetup.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
