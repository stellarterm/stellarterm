import React from 'react';
import PropTypes from 'prop-types';
import LoginPage from './LoginPage/LoginPage';
import Driver from '../../lib/Driver';
import SessionActivate from './SessionActivate/SessionActivate';
import SessionLoading from './SessionLoading/SessionLoading';
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
        const { props } = this;
        const { d, urlParts } = this.props;
        const { state, unfundedAccountId } = d.session;

        switch (state) {
        case 'out':
            return <LoginPage {...props} d={d} urlParts={urlParts} />;
        case 'unfunded':
            return <SessionActivate unfundedAccountId={unfundedAccountId} d={d} isTestnet={isTestnet} />;
        case 'loading':
            return <SessionLoading />;
        case 'in':
            return <SessionContent {...props} d={d} />;
        default:
            break;
        }
        return null;
    }
}

Session.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    urlParts: PropTypes.string,
    isTestnet: PropTypes.bool,
};
