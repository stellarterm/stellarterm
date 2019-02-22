/*
  This file contains the Effects History Component.
  This component is the parent of the Effects History
  Table Component: HistoryTable.jsx. It has checkboxes
  used to filter effects.
*/
import React from 'react';
import PropTypes from 'prop-types';
import HistoryTable from './HistoryTable';
import Driver from '../../lib/Driver';

export default class HistoryView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            trade: true,
            account: true,
            signer: true,
            trustline: true,
        };

        this.props.d.history.handlers.touch();
        this.listenId = this.props.d.history.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.props.d.history.event.unlisten(this.listenId);
    }

    getFilterButtons() {
        return (
            <div className="s-buttonGroup HistoryView__header__right__buttonGroup">
                {this.createFilterButton(this.state.trade, 'trade')}
                {this.createFilterButton(this.state.account, 'account')}
                {this.createFilterButton(this.state.signer, 'signer')}
                {this.createFilterButton(this.state.trustline, 'trustline')}
            </div>
        );
    }

    createFilterButton(filterType, text) {
        const filterIsActive = filterType ? ' is-active' : '';

        return (
            <button
                className={`s-button s-button--light text__capitalize${filterIsActive}`}
                onClick={() => { this.updateFilter(`${text}`); }}>
                {text}
            </button>
        );
    }

    updateFilter(name) {
        this.setState({ [name]: !this.state[name] });
    }

    render() {
        const filterToggles = this.getFilterButtons();

        return (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="island__header">
                        <div className="HistoryView__header">
                            <div className="HistoryView__header__left">Account History</div>
                            <div className="HistoryView__header__right">
                                <span className="HistoryView__header__right__label">Filter: </span>
                                {filterToggles}
                            </div>
                        </div>
                    </div>

                    <HistoryTable d={this.props.d} filters={this.state} />
                </div>
            </div>
        );
    }
}

HistoryView.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
