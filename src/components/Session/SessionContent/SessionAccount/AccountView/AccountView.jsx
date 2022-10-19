import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../../../lib/driver/Driver';
import Generic from '../../../../Common/Generic/Generic';
import ReservedBalance from './ReservedBalance/ReservedBalance';
import BalancesTable from './BalancesTable/BalancesTable';

export default class AccountView extends React.Component {
    componentDidMount() {
        if (this.$ref && window.location.href.includes('#reserved')) {
            this.$ref.scrollIntoView();
        }
    }

    render() {
        const { props } = this;
        const { d } = this.props;

        return (
            <div>
                <div className="so-back islandBack">
                    <div className="island">
                        <div className="island__header">Balances</div>
                        <div className="AccountView_content">
                            By default, your account is only configured to accept <strong>XLM</strong>. In order to
                            receive other assets, you must <Link to="/account/addTrust/">accept</Link> them using the{' '}
                            <strong>Accept assets</strong> tool.
                        </div>
                        <BalancesTable d={d} {...props} />
                    </div>
                </div>

                <Generic noTopPadding>
                    <h2>Where is the money stored?</h2>
                    <p>
                        In the Stellar network, funds exist on the network and can only be moved by whoever has the
                        secret key. This means that your secret key is extremely sensitive, and whoever has access to it
                        can move the funds. However, money is <strong>NOT</strong> actually <em>{'"inside"'}</em>{' '}
                        StellarTerm. StellarTerm is just a helpful tool that helps you use your secret key to make
                        transactions.
                    </p>

                    <p>
                        <strong>WARNING</strong>: Be extremely careful with your secret key and do not share it with
                        anybody.
                    </p>
                </Generic>

                <div
                    className="so-back islandBack"
                    id="reserved"
                    ref={ref => {
                        this.$ref = ref;
                    }}
                >
                    <div className="island">
                        <div className="island__header">Reserved Balance</div>
                        <ReservedBalance d={d} />
                    </div>
                </div>
            </div>
        );
    }
}

AccountView.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
