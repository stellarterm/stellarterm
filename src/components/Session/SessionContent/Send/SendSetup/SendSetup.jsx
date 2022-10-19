import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../lib/driver/Driver';
import SendDest from './SendDest';
import SendAsset from './SendAsset';
import SendMemo from './SendMemo';

export default class SendSetup extends React.Component {
    constructor(props) {
        super(props);

        this.listenId = this.props.d.send.event.listen(() => {
            this.forceUpdate();
        });

        this.ubsubHistory = this.props.routeHistory.listen(() => {
            if (this.props.routeHistory.action !== 'POP') {
                return;
            }

            try {
                this.props.d.send.pickAssetToSend(this.getAssetFromUrl());
            } catch (e) {
                console.error(e);
            }
        });
    }

    componentDidMount() {
        const slug = this.getAssetFromUrl();
        try {
            window.history.pushState({}, null, `/account/send?asset=${slug}`);
            this.props.d.send.pickAssetToSend(slug);
        } catch (e) {
            console.error(e);
        }
    }

    componentWillUnmount() {
        this.props.d.send.event.unlisten(this.listenId);
        this.ubsubHistory();
    }

    getAssetFromUrl() {
        this.props.d.send.fetchSelfAssets();
        const urlParams = new URLSearchParams(window.location.search);
        const noAssetParam = urlParams.get('asset') === null;
        return noAssetParam ? this.props.d.send.choosenSlug : urlParams.get('asset');
    }

    render() {
        const { d } = this.props;
        const { clickReviewPayment, allFieldsValid } = d.send;

        return (
            <div className="Send_block">
                <div className="Send_title">
                    <h1>Send payment</h1>
                    <div className="field_description">
                        Send assets directly to any Stellar wallet
                    </div>
                </div>

                <SendDest d={d} />

                <SendAsset d={d} />

                <SendMemo d={d} />

                <div className="Input_flexed_block">
                    <div className="Send_input_block" />
                    <div className="Send_button_block">
                        <button
                            className="s-button"
                            disabled={!allFieldsValid}
                            onClick={() => clickReviewPayment()}>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

SendSetup.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    routeHistory: PropTypes.objectOf(PropTypes.any),
};
