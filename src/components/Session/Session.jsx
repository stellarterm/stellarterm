import React from 'react';
import PropTypes from 'prop-types';

import LoginPage from './LoginPage/LoginPage';
import Driver from '../../lib/Driver';
import SessionActivate from './SessionActivate/SessionActivate';
import SessionLoading from './SessionLoading/SessionLoading';
import SessionWelcome from './SessionWelcome/SessionWelcome';
import SessionContent from './SessionContent/SessionContent';

export default class Session extends React.Component {
    constructor(props) {
        super(props);
        this.listenId = this.props.d.session.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.props.d.session.event.unlisten(this.listenId);
    }

    render() {
        const { d, urlParts } = this.props;
        const { state, unfundedAccountId, inflationDone } = d.session;

        switch (state) {
        case 'out':
            return <LoginPage d={d} urlParts={urlParts} />;
        case 'unfunded':
            return <SessionActivate unfundedAccountId={unfundedAccountId} />;
        case 'loading':
            return <SessionLoading />;
        case 'in':
            if (!inflationDone) {
                return <SessionWelcome d={d} />;
            }
            return <SessionContent d={d} route={urlParts[1]} />;
        default:
            break;
        }
        return null;
    }
}

Session.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    urlParts: PropTypes.arrayOf(PropTypes.string),
};
