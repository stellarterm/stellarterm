import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import SendSetup from './SendSetup/SendSetup';
import SendError from './SendError/SendError';
import SendReview from './SendReview/SendReview';
import SendSuccess from './SendSuccess/SendSuccess';

export default class Send extends React.Component {
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
        const d = this.props.d;
        const state = d.send.state;
        let sendActionBlock = <SendError d={d} />;

        if (state === 'setup') {
            sendActionBlock = <SendSetup d={d} />;
        } else if (state === 'review' || state === 'pending') {
            sendActionBlock = <SendReview d={d} />;
        } else if (state === 'success') {
            sendActionBlock = <SendSuccess d={d} />;
        } else if (state === 'success_signers') {
            sendActionBlock = <SendSuccess d={d} awaitSigners />;
        }

        const islandClass = `island ${state !== 'setup' ? 'Send_short' : ''}`;

        return (
            <div className="so-back islandBack islandBack--t">
                <div className={islandClass}>
                    {sendActionBlock}
                </div>
            </div>
        );
    }
}

Send.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
