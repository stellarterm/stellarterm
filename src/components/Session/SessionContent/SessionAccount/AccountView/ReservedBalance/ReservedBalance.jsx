import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import images from '../../../../../../images';
import Driver from '../../../../../../lib/Driver';
import ReservedDescription from './ReservedDescription/ReservedDescription';

export default function ReservedBalance(props) {
    const reserveData = props.d.session.account.explainReserve();
    const reserveTypesMap = new Map([
        ['Trustlines', '/account/assets/'],
        ['Signers', '/account/multisig/'],
        ['Offers', '/account/activity/orders/'],
    ]);

    const reservedRows = reserveData.reserveItems.map(({ reserveType, typeCount, reservedXLM }) => {
        const iconBlockClass = `${reserveTypesMap.has(reserveType) ? 'reserve_with_icon' : 'reserve_no_icon'}`;

        const reserveRow = (
            <div className="reserved_item" key={`${reserveType}-${typeCount}`}>
                <span>
                    {reserveType} {typeCount === 0 ? '' : `(${typeCount})`}
                </span>
                <span className={iconBlockClass}>
                    {reservedXLM} XLM
                    {reserveTypesMap.has(reserveType) ? (
                        <img className="icon_arrow" src={images['icon-arrow-right']} alt="icon-arrow" />
                    ) : (
                        ''
                    )}
                </span>
            </div>
        );

        if (reserveTypesMap.has(reserveType)) {
            const accountTabLink = reserveTypesMap.get(reserveType);

            return (
                <Link to={accountTabLink} key={reserveType}>
                    {reserveRow}
                </Link>
            );
        }
        return reserveRow;
    });

    return (
        <div className="reserved_Balance">
            <ReservedDescription />

            <div className="reserved_table_wrapper">
                <div className="reserved_table">{reservedRows}</div>

                <div className="reserved_item_total">
                    <span>Total reserved</span>
                    <span>{reserveData.totalReservedXLM}</span>
                </div>
            </div>
        </div>
    );
}

ReservedBalance.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
