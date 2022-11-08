import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Driver from '../../../lib/driver/Driver';
import images from '../../../images';
import AppPopover from './AppPopover';

export default function ReservedPopover(props) {
    const { d, asset, onlyIcon } = props;
    const { account } = d.session;

    const targetBalance = account.getBalance(asset);
    if (parseFloat(targetBalance) === 0) { return null; }

    const isXlmNative = asset.isNative();
    const reserveData = account.explainReserve();
    const { totalReservedXLM, reserveItems } = reserveData;
    const reservedAmount = isXlmNative ? totalReservedXLM : account.getReservedBalance(asset);
    const isNoTrustline = reservedAmount === null;

    if (isNoTrustline) { return null; }

    const reservedRows = reserveItems.map(({ reserveType, typeCount, reservedXLM }) => (
        <div className="reserved_item" key={`${reserveType}-${typeCount}`}>
            <span>
                {reserveType} {typeCount === 0 ? '' : `(${Math.abs(typeCount)})`}
            </span>
            <span>{reservedXLM} XLM</span>
        </div>
    ));

    return (
        <React.Fragment>
            <AppPopover
                content={
                    isXlmNative ? (
                        <div className="reserve_table">
                            <div className="reserved_item reserved_item_bold">
                                <span>Reserved</span>
                                <span>{reservedAmount} XLM</span>
                            </div>
                            {reservedRows}
                            <Link to="/account#reserved" className="reserved_link">
                                More information
                                <img className="icon_arrow" src={images['icon-arrow-right']} alt="arrow" />
                            </Link>
                        </div>
                    ) : (
                        <React.Fragment>
                            <p><strong>{reservedAmount} {asset.code}</strong> reserved in active offers</p>
                            <Link to="/account/activity/" className="reserved_link">
                                More information
                                <img className="icon_arrow" src={images['icon-arrow-right']} alt="arrow" />
                            </Link>
                        </React.Fragment>
                    )
                } />
            {onlyIcon
                ? null
                : <div>{reservedAmount} {asset.code} are reserved in your wallet by Stellar network</div>}
        </React.Fragment>
    );
}

ReservedPopover.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
    asset: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.bool])).isRequired,
    onlyIcon: PropTypes.bool,
};
