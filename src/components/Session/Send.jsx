import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import SendSetup from './SendSetup';
import SendPending from './SendPending';
import SendError from './SendError';
import SendSuccess from './SendSuccess';

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

        if (state === 'setup') {
            return <SendSetup d={d} />;
        } else if (state === 'pending') {
            return <SendPending />;
        } else if (state === 'success') {
            return <SendSuccess d={d} />;
        }
        return <SendError d={d} />;
    }
}

Send.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
