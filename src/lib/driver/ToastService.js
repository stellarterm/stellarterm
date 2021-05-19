import Event from '../Event';

export const TOAST_CONTENT_TYPES = {
    default: 'default',
    template: 'template',
};

export const TOAST_TYPES = {
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning',
};

export default class ToastService {
    constructor(driver) {
        this.event = new Event();
        this.driver = driver;
        this.activeToasts = [];
        this.lastOpTime = 0;
    }

    clearToasts() {
        this.activeToasts = [];
    }

    showToast(type, title, text) {
        this.activeToasts.push({
            content: TOAST_CONTENT_TYPES.default,
            type,
            title,
            text,
        });

        this.event.trigger();
    }

    showTemplateToast(type, template) {
        this.activeToasts.push({
            content: TOAST_CONTENT_TYPES.template,
            type,
            template,
        });

        this.event.trigger();
    }

    success(title, text) {
        this.showToast(TOAST_TYPES.success, title, text);
    }

    error(title, text) {
        this.showToast(TOAST_TYPES.error, title, text);
    }

    warning(title, text) {
        this.showToast(TOAST_TYPES.warning, title, text);
    }

    info(title, text) {
        this.showToast(TOAST_TYPES.info, title, text);
    }

    successTemplate(template) {
        this.showTemplateToast(TOAST_TYPES.success, template);
    }
}
