import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import AssetCard2 from '../../../../../AssetCard2';
import SendEditLink from '../Common/SendEditLink';

export default class SendAsset extends React.Component {
    getStepContent() {
        const { isCurrentStep, stepIsPassed } = this.props;

        if (stepIsPassed) {
            return this.stepPassedContent();
        } else if (isCurrentStep) {
            return (
                <div className="Send__content">
                    <div className="Send__assetPicker">{this.getAvaliableAssets()}</div>
                    <div className="Send__panel__next" />
                </div>
            );
        }
        return null;
    }

    getAvaliableAssets() {
        const { availableAssets, handlers } = this.props.d.send;

        return _.map(availableAssets, (availability, slug) => {
            const rightRowContent = availability.sendable ? (
                <div className="row__shareOption">
                    <a
                        className="s-button"
                        onClick={() => { handlers.step2PickAsset(slug); }}>
                        Send {availability.asset.getCode()}
                    </a>
                </div>
            ) : (<div className="row__shareOption">Destination does not accept this asset.</div>);

            return (
                <div className="row--lite" key={slug}>
                    <div className="row__fixedAsset">
                        <AssetCard2 code={availability.asset.getCode()} issuer={availability.asset.getIssuer()} />
                    </div>
                    {rightRowContent}
                </div>
            );
        });
    }

    stepPassedContent() {
        const { asset } = this.props.d.send.step2.availability;
        return (
            <div className="Send__content Send__overview Send__assetContainer">
                <AssetCard2 code={asset.getCode()} issuer={asset.getIssuer()} />
            </div>
        );
    }

    render() {
        const { d, isCurrentStep, stepIsPassed } = this.props;
        const { step2Edit } = d.send.handlers;
        const stepContent = this.getStepContent();

        return (
            <div className={`Send__panel${!isCurrentStep && !stepIsPassed ? ' is-future' : ''}`}>
                <h3 className={`Send__title${isCurrentStep ? ' is-active' : ''}`}>
                    2. Asset <SendEditLink stepIsPassed={stepIsPassed} editStep={step2Edit} />
                </h3>
                {stepContent}
            </div>
        );
    }
}

SendAsset.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    isCurrentStep: PropTypes.bool.isRequired,
    stepIsPassed: PropTypes.bool.isRequired,
};
