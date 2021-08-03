import React from 'react';
import PropTypes from 'prop-types';
import { EFFECTS_EVENTS } from '../../../../lib/driver/Effects';
import Driver from '../../../../lib/Driver';


export default class ActivityFromEffectsBase extends React.Component {
    static filterEffects() {}

    constructor(props) {
        super(props);

        this.unsub = this.props.d.effects.event.sub(event => {
            if (
                (
                    event.type === EFFECTS_EVENTS.NEXT_HISTORY_REQUEST &&
                    !this.constructor.filterEffects(event.newItems).length
                ) || (
                    event.type === EFFECTS_EVENTS.GET_HISTORY_REQUEST &&
                    !this.constructor.filterEffects(this.props.d.effects.effectsHistory).length
                )
            ) {
                this.props.d.effects.loadMoreHistory();
            }

            this.forceUpdate();
        });
    }

    componentDidMount() {
        if (!this.props.d.effects.effectsHistory.length && !this.props.d.effects.loading) {
            this.props.d.effects.getEffectsHistory();
        }
        const history = this.constructor.filterEffects(this.props.d.effects.effectsHistory);

        if (this.props.d.effects.effectsHistory.length &&
            history.length === 0 &&
            !this.props.d.effects.isFullLoaded &&
            !this.props.d.effects.loading
        ) {
            this.props.d.effects.loadMoreHistory();
        }
    }

    componentWillUnmount() {
        this.unsub();
    }
}
ActivityFromEffectsBase.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
