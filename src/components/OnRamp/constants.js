import * as EnvConsts from '../../env-consts';

const onRampApiParams = {
    mode: 'buy',
};

const onRampThemeParams = {
    themeName: 'light',
    primaryColor: '68C86F',
    secondaryColor: 'FFFFFF',
    containerColor: 'FFFFFF',
    cardColor: 'F4F4F5',
    primaryTextColor: '1C2E3E',
    secondaryTextColor: '9AA6AC',
    borderRadius: '0.5',
    wgBorderRadius: '1',
};

export const onRampUrl = EnvConsts.ONRAMPER_URL;

export const onRampStaticParams = { ...onRampApiParams, ...onRampThemeParams };
