import Debounce from 'awesome-debounce-promise';
import React from 'react';
import PropTypes from 'prop-types';
import Stellarify from '../../../../../lib/Stellarify';
import Driver from '../../../../../lib/Driver';
import Ellipsis from '../../../../Ellipsis';
import AddTrustRow from '../Common/AddTrustRow';
import MessageRow from './MessageRow/MessageRow';

const DEBOUNCE_TYME = 700;
const resolveAncor = Debounce(StellarSdk.StellarTomlResolver.resolve, DEBOUNCE_TYME);

export default class AddTrustFromFederation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorDomain: '',
            allCurrencies: [],
            resolveState: '',
        };
    }

    async getAssetsFromUrl(domain) {
        try {
            const resolvedAncor = await resolveAncor(domain);

            const { anchorDomain } = this.state;
            if (domain !== anchorDomain) {
                return;
            }

            this.setState({
                resolveState: 'found',
                allCurrencies: resolvedAncor.CURRENCIES,
            });
        } catch (e) {
            const { anchorDomain } = this.state;
            if (domain !== anchorDomain) {
                return;
            }

            this.setState({
                resolveState: 'notfound',
                allCurrencies: [],
            });
        }
    }

    handleInputFederation({ target }) {
        const anchorDomain = target.value;
        const resolveState = anchorDomain ? 'pending' : '';

        this.setState({
            allCurrencies: [],
            resolveState,
            anchorDomain,
        });

        if (anchorDomain) {
            this.getAssetsFromUrl(anchorDomain);
        }
    }

    render() {
        let assetResults;
        const { resolveState, anchorDomain, allCurrencies } = this.state;

        switch (resolveState) {
        case 'notfound':
            assetResults = (
                    <MessageRow isError>
                        <span>Unable to find currencies for {anchorDomain}</span>
                    </MessageRow>
                );
            break;
        case 'pending':
            assetResults = (
                    <MessageRow>
                        <span>Loading currencies for {anchorDomain}</span>
                        <Ellipsis />
                    </MessageRow>
                );
            break;
        case 'found':
            assetResults = allCurrencies.map((currency) => {
                const asset = Stellarify.assetToml(currency);
                const key = currency.code + currency.issuer;
                return <AddTrustRow key={key} d={this.props.d} asset={asset} />;
            });
            break;
        default:
            break;
        }

        return (
            <div className="island">
                <div className="island__header">Accept asset via anchor domain</div>
                <div className="island__paddedContent">
                    <p>You can accept an asset by entering the domain name of the issuer.</p>

                    <label className="s-inputGroup AddTrust__inputGroup" htmlFor="anchorDomainInput">
                        <span className="s-inputGroup__item s-inputGroup__item--tag S-flexItem-1of4">
                            <span>Anchor Domain</span>
                        </span>

                        <input
                            className="s-inputGroup__item S-flexItem-share"
                            type="text"
                            name="anchorDomainInput"
                            value={anchorDomain}
                            onChange={e => this.handleInputFederation(e)}
                            placeholder="example: sureremit.co" />
                    </label>
                </div>
                {assetResults}
            </div>
        );
    }
}

AddTrustFromFederation.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
