import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../../../lib/Driver';
import HistoryTable from './HistoryTable/HistoryTable';
import Ellipsis from '../../../Common/Ellipsis/Ellipsis';

const isElementVisible = (element) => {
    try {
        const elementPos = {
            top: window.pageYOffset + element.getBoundingClientRect().top,
            bottom: window.pageYOffset + element.getBoundingClientRect().bottom,
        };
        const windowPos = {
            top: window.pageYOffset,
            bottom: window.pageYOffset + document.documentElement.clientHeight,
        };

        // Return true if DOM element is visible
        return !!(elementPos.bottom > windowPos.top && elementPos.top < windowPos.bottom);
    } catch (e) {
        return false;
    }
};

export default class History extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            trade: true,
            account: true,
            signer: true,
            trustline: true,
        };

        this.bindedScroll = this.scrollHandler.bind(this);

        this.listenId = this.props.d.history.event.listen(() => {
            this.forceUpdate();
        });
    }

    componentWillMount() {
        this.loadMoreHistoryCheck();
    }

    componentDidUpdate() {
        this.loadMoreHistoryCheck();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.bindedScroll);
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

    loadMoreHistoryCheck() {
        const bottomRow = document.querySelector('#scroll_row_bottom');
        const isBottomVisible = isElementVisible(bottomRow);
        this.props.d.history.handlers.loadHistory(isBottomVisible);
        window.addEventListener('scroll', this.bindedScroll);
    }

    scrollHandler() {
        const bottomRow = document.querySelector('#scroll_row_bottom');
        const isBottomVisible = isElementVisible(bottomRow);

        if (isBottomVisible && this.props.d.history.isLoading === false) {
            // If scrolled to bottom row, init loading and remove listener
            window.removeEventListener('scroll', this.bindedScroll);
            this.props.d.history.handlers.loadHistory(isBottomVisible);
        }
    }

    createFilterButton(filterState, filterName) {
        const filterIsActive = filterState ? ' is-active' : '';

        return (
            <button
                className={`s-button s-button--light text__capitalize${filterIsActive}`}
                onClick={() => {
                    this.updateFilter(`${filterName}`);
                }}>
                {filterName}
            </button>
        );
    }

    updateFilter(name) {
        const currentState = this.state[name];
        const isLastFilter = currentState && Object.values(this.state).filter(el => el === true).length === 1;
        if (!isLastFilter) {
            this.setState({ [name]: !currentState });
        }
    }

    render() {
        const filterToggles = this.getFilterButtons();

        return (
            <div className="so-back islandBack islandBack--t">
                <div className="island">
                    <div className="island__header">
                        <div className="HistoryView__header">
                            <div className="HistoryView__header__left">
                                Account History
                                {this.props.d.history.isLoading ? <Ellipsis /> : null}
                            </div>
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

History.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
