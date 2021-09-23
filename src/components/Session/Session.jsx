import React from 'react';
import PropTypes from 'prop-types';
import LoginPage from './LoginPage/LoginPage';
import Driver from '../../lib/Driver';
import SessionActivate from './SessionActivate/SessionActivate';
import SessionLoading from './SessionLoading/SessionLoading';
import SessionContent from './SessionContent/SessionContent';
import { SESSION_STATE } from '../../lib/constants';

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
            case SESSION_STATE.OUT:
                return <LoginPage {...props} d={d} urlParts={urlParts} />;
            case SESSION_STATE.UNFUNDED:
                return <SessionActivate unfundedAccountId={unfundedAccountId} d={d} />;
            case SESSION_STATE.LOADING:
                return <SessionLoading />;
            case SESSION_STATE.IN:
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
};
