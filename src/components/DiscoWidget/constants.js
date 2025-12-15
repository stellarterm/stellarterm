import * as EnvConsts from '../../env-consts';

const widgetApiParams = {
    operationMode: 'buy',
};

const widgetThemeParams = {
    theme: 'light',
    backgroundColor: 'transparent',
    backgroundCard: 'FFFFFF',
    borderColor: 'F4F4F5',
    buttonBackground: '68C86F',
    skeletonGradientFrom: 'F4F4F5',
    hoverColor: 'F4F4F5',
    secondTextColor: '9AA6AC',
    textColor: '1C2E3E',
    iconsColor: '68C86F',
};

export const widgetUrl = EnvConsts.WIDGET_URL;

export const widgetStaticParams = { ...widgetApiParams, ...widgetThemeParams };
