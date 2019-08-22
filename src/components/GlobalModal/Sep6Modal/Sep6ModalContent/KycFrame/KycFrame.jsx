import React from 'react';
import PropTypes from 'prop-types';
import EstimatedTime from '../../Common/EstimatedTIme';
import images from '../../../../../images';

export default function KycForm(props) {
    const { sizes, kycUrl, status, moreInfo, time } = props;
    const frameSizes = sizes === '' ? { width: 500, height: 500 } : { width: sizes.width, height: sizes.height };
    const statusText = new Map([
        ['denied', 'Your KYC request declined!'],
        ['pending', 'Your KYC request is pending, please wait.'],
    ]);
    // status: can be only one of 'pending' || 'denied'
    const noStatus = status === '';
    const noFrameUrl = kycUrl === '';
    const noMoreInfo = moreInfo === '';
    const noEtaTime = time === '';

    return (
        <React.Fragment>
            {noStatus ? null : (
                <div className="content_block">
                    <div className="content_title">
                        {status === 'pending' ? (
                            <img src={images['icon-clock']} alt="wait" />
                        ) : (
                            <img src={images['icon-circle-fail']} alt="error" />
                        )}

                        {statusText.has(status) ? statusText.get(status) : null}
                    </div>
                    {noMoreInfo ? null : <div className="content_text">{moreInfo}</div>}
                </div>
            )}

            {noEtaTime || noStatus ? null : <EstimatedTime time={time} kycTime />}

            {noFrameUrl || !noStatus ? null : (
                <div className="kyc_frame_container">
                    <iframe src={kycUrl} width={frameSizes.width} height={frameSizes.height} allow="camera" />
                </div>
            )}
        </React.Fragment>
    );
}

KycForm.propTypes = {
    sizes: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.number)]).isRequired,
    time: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    kycUrl: PropTypes.string,
    status: PropTypes.string,
    moreInfo: PropTypes.string,
};
