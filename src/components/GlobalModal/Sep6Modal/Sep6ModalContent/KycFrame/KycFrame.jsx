import React from 'react';
import PropTypes from 'prop-types';
import EstimatedTime from '../../Common/EstimatedTIme';
import images from '../../../../../images';

export default function KycFrame(props) {
    const { sizes, kycUrl, status, moreInfo, time } = props;
    const frameSizes = sizes === '' ? { width: 500, height: 500 } : { width: sizes.width, height: sizes.height };
    const statusText = new Map([
        ['denied', 'Your KYC request declined!'],
        ['pending', 'Your KYC request is pending, please wait.'],
    ]);

    return (
        <React.Fragment>
            {status ? (
                <div className="content_block">
                    <div className="content_title">
                        {status === 'pending' ? (
                            <img src={images['icon-clock']} alt="wait" />
                        ) :
                            null
                        }

                        {statusText.has(status) ? statusText.get(status) : null}
                    </div>
                    {moreInfo ? <div className="content_text">{moreInfo}</div> : null}
                </div>
            ) : null}

            {time && status ? <EstimatedTime time={time} kycTime /> : null}

            {kycUrl && !status ? (
                <div className="kyc_frame_container">
                    <iframe src={kycUrl} width={frameSizes.width} height={frameSizes.height} allow="camera" />
                </div>
            ) : null}
        </React.Fragment>
    );
}

KycFrame.propTypes = {
    sizes: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.number)]).isRequired,
    time: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    kycUrl: PropTypes.string,
    status: PropTypes.string,
    moreInfo: PropTypes.string,
};
