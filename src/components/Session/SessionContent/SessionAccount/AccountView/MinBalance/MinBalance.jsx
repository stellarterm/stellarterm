import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../../../lib/Driver';
import MinBalanceDescription from './MinBalanceDescription/MinBalanceDescription';

export default function MinBalance(props) {
    const explanation = props.d.session.account.explainReserve();

    const minBalanceRows = explanation.items.map(({ entryType, amount, XLM }) => (
        <tr key={entryType}>
            <td className="MinBalance__table__type">{entryType}</td>
            <td>{amount}</td>
            <td className="MinBalance__table__lumens">{XLM}</td>
        </tr>
    ));

    return (
        <div id="minBalance">
            <div className="island__sub">
                <MinBalanceDescription />

                <div className="island__sub__division MinBalance__sub MinBalance__sub--table">
                    <table className="MinBalance__table">
                        <thead className="MinBalance__table__head">
                            <tr>
                                <td className="MinBalance__table__type">Entry type</td>
                                <td>#</td>
                                <td className="MinBalance__table__lumens">XLM</td>
                            </tr>
                        </thead>

                        <tbody>
                            {minBalanceRows}

                            <tr key={-1} className="MinBalance__table__total">
                                <td className="MinBalance__table__type">
                                    <strong>Total</strong>
                                </td>
                                <td />
                                <td className="MinBalance__table__lumens">
                                    <strong>{explanation.totalLumens}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

MinBalance.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
