import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/Driver';
import images from '../../images';
import { TOAST_CONTENT_TYPES, TOAST_TYPES } from '../../lib/driver/ToastService';

export default class ToastTemplate extends React.Component {
    static getIconName(type) {
        switch (type) {
            case TOAST_TYPES.success: {
                return '24-icon-success-circle';
            }
            case TOAST_TYPES.error: {
                return '24-icon-error-circle';
            }
            case TOAST_TYPES.warning: {
                return '24-icon-warning-triangle';
            }
            case TOAST_TYPES.info: {
                return 'icon-info';
            }
            default: throw new Error('Unknown toast type');
        }
    }

    constructor(props) {
        super(props);

        this.unsub = this.props.d.toastService.event.sub(() => {
            clearTimeout(this.timeout);
            this.setState({ isVisible: true });
        });

        this.state = {
            isVisible: false,
        };
    }

    componentWillUnmount() {
        this.unsub();
    }

    getToastTemplate(toast, index) {
        const toastBody = toast.content === TOAST_CONTENT_TYPES.template ? toast.template : (
            <React.Fragment>
                <div className={`popup-title ${toast.type === TOAST_TYPES.error ? 'error' : ''}`}>{toast.title}</div>
                <div className="popup-text">{toast.text}</div>
            </React.Fragment>
        );

        const iconName = this.constructor.getIconName(toast.type);

        return (
            <div className="popup-body" key={`toast-${index}`}>
                <div className={`popup-icon-cell ${toast.type === TOAST_TYPES.error || toast.type === TOAST_TYPES.warning ? 'small' : ''}`}>
                    <img src={images[iconName]} alt="Ok-icon" />
                </div>
                <div className="popup-content-cell">{toastBody}</div>
            </div>
        );
    }

    hideToasts() {
        this.setState({ isVisible: false });
        setTimeout(() => {
            this.props.d.toastService.clearToasts();
        }, 500);
    }

    render() {
        const { isVisible } = this.state;

        if (isVisible) {
            this.timeout = setTimeout(() => this.hideToasts(), 30000);
        }

        const allToasts = this.props.d.toastService.activeToasts.map(
            (toast, index) => this.getToastTemplate(toast, index),
        ).filter(toast => toast !== null);

        return allToasts.length > 0 ? (
            <div className={`PopupAlert ${isVisible ? 'popup-show' : ''}`}>
                <img src={images['icon-close']} alt="X" className="icon-close" onClick={() => this.hideToasts()} />
                {allToasts}
            </div>
        ) : null;
    }
}

ToastTemplate.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
