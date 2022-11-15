import React from 'react';
import PropTypes from 'prop-types';
import Driver from '../../lib/driver/Driver';
import images from '../../images';
import { TOAST_CONTENT_TYPES, TOAST_TYPES } from '../../lib/driver/driverInstances/ToastService';

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
        const { content, type, title, text, onClick, template } = toast;
        const toastBody = content === TOAST_CONTENT_TYPES.template ? template : (
            <React.Fragment>
                <div className={`popup-title ${type === TOAST_TYPES.error ? 'error' : ''}`}>{title}</div>
                <div className="popup-text">{text}</div>
            </React.Fragment>
        );

        const iconName = this.constructor.getIconName(type);

        return (
            <div
                className={`popup-body ${onClick ? 'popup-body-clickable' : ''}`}
                key={`toast-${index}`}
                onClick={() => {
                    if (onClick) { onClick(); }
                }}
            >
                <div className={`popup-icon-cell ${type === TOAST_TYPES.error || type === TOAST_TYPES.warning ? 'small' : ''}`}>
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
