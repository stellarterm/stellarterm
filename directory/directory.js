// This code is licensed under Apache-2.0.
// It is released AS-IS and without warranty.
// This is simply for informational purposes. The creators of this file does
// not endorse any of this information.

const DirectoryBuilder = require('./DirectoryBuilder');

const directory = new DirectoryBuilder();
directory.DirectoryBuilder = DirectoryBuilder;

// Template:
// directory.addAnchor({
//   domain: 'DOMAINDOTCOM',
//   website: 'https://DOMAINDOTCOM',
//   logo: 'DOMAINDOTCOM',
//   color: '#rrggbb',
//   displayName: 'Domain dot com',
// });
// directory.addAsset('DOMAINDOTCOM', {
//   code: 'ASSETCODE_ASSETCODE',
//   issuer: 'Ga_issuer_account_id',
// });

directory.addAnchor({
    domain: 'ternio.io',
    website: 'https://ternio.io',
    logo: 'ternio.io',
    color: '#1D344F',
    displayName: 'TERN',
});

directory.addAsset('ternio.io', {
    code: 'TERN',
    issuer: 'GDGQDVO6XPFSY4NMX75A7AOVYCF5JYGW2SHCJJNWCQWIDGOZB53DGP6C',
    type: 'token',
});

directory.addAnchor({
    domain: 'thewwallet.com',
    website: 'https://thewwallet.com',
    logo: 'thewwallet.com',
    color: '#b59a63',
    displayName: 'WhiteWallet',
});

directory.addAsset('thewwallet.com', {
    code: 'WSD',
    issuer: 'GDSVWEA7XV6M5XNLODVTPCGMAJTNBLZBXOFNQD3BNPNYALEYBNT6CE2V',
    type: 'token',
});

directory.addAnchor({
    domain: 'anchorusd.com',
    website: 'https://anchorusd.com',
    logo: 'anchorusd.com',
    color: '#00b4ce',
    displayName: 'AnchorUSD',
});

directory.addAsset('anchorusd.com', {
    code: 'USD',
    issuer: 'GDUKMGUGDZQK6YHYA5Z6AY2G4XDSZPSZ3SW5UN3ARVMO6QSRDWP5YLEX',
    type: 'token',
});

directory.addAnchor({
    domain: 'cryptotari.io',
    website: 'https://cryptotari.io',
    logo: 'cryptotari.io',
    color: '#E31E24',
    displayName: 'TARI',
});

directory.addAsset('cryptotari.io', {
    code: 'TARI',
    issuer: 'GD7UVDDJHJYKUXB4SJFIC6VJDQ4YADQCMRN3KLHJFV4H6NIUAEREVCO7',
    type: 'token',
});

directory.addAnchor({
    domain: 'frasindo.com',
    website: 'https://frasindo.com',
    logo: 'frasindo.com',
    color: '#be3785',
    displayName: 'Frasindo',
});

directory.addAsset('frasindo.com', {
    code: 'FRAS',
    issuer: 'GC75WHUIMU7LV6WURMCA5GGF2S5FWFOK7K5VLR2WGRKWKZQAJQEBM53M',
    type: 'token',
});

directory.addAnchor({
    domain: 'pedity.com',
    website: 'https://pedity.com',
    logo: 'pedity.com',
    color: '#2a8bc6',
    displayName: 'Pedity',
});

directory.addAsset('pedity.com', {
    code: 'PEDI',
    issuer: 'GBVUDZLMHTLMZANLZB6P4S4RYF52MVWTYVYXTQ2EJBPBX4DZI2SDOLLY',
    instructions: 'https://pedity.com',
    type: 'token',
});

directory.addAnchor({
    domain: 'nezly.com',
    website: 'https://nezly.com',
    logo: 'nezly.com',
    color: '#523b83',
    displayName: 'Nezly',
});

directory.addAsset('nezly.com', {
    code: 'NEZ',
    issuer: 'GDGKBRCPW4C3ENNC5C64PE6U33MG52GBKFXOK5P3OSWF74DAOXRXV6OJ',
    instructions: 'https://nezly.com',
    unlisted: true,
});

directory.addAsset('nezly.com', {
    code: 'ETH',
    issuer: 'GDGKBRCPW4C3ENNC5C64PE6U33MG52GBKFXOK5P3OSWF74DAOXRXV6OJ',
    instructions: 'https://nezly.com',
    unlisted: true,
});

directory.addAsset('nezly.com', {
    code: 'BTC',
    issuer: 'GDGKBRCPW4C3ENNC5C64PE6U33MG52GBKFXOK5P3OSWF74DAOXRXV6OJ',
    instructions: 'https://nezly.com',
    unlisted: true,
});

directory.addAnchor({
    domain: 'smartlands.io',
    website: 'https://smartlands.io',
    logo: 'smartlands.io',
    color: '#35AB62',
    displayName: 'Smartlands',
});

directory.addAsset('smartlands.io', {
    code: 'SLT',
    issuer: 'GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP',
    instructions: 'https://smartlands.io',
    type: 'token',
});

directory.addAnchor({
    domain: 'repocoin.io',
    website: 'https://repocoin.io',
    logo: 'repocoin.io',
    color: '#192854',
    displayName: 'Repocoin',
});

directory.addAsset('repocoin.io', {
    code: 'REPO',
    issuer: 'GCZNF24HPMYTV6NOEHI7Q5RJFFUI23JKUKY3H3XTQAFBQIBOHD5OXG3B',
    instructions: 'https://repocoin.io',
    type: 'token',
});

directory.addAnchor({
    domain: 'stronghold.co',
    website: 'https://stronghold.co',
    logo: 'stronghold.co',
    color: '#13ce66',
    displayName: 'Stronghold',
});

directory.addAsset('stronghold.co', {
    code: 'XLM',
    issuer: 'GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG',
    instructions: 'https://stronghold.co/send-receive-lumens.html',
    unlisted: true,
});

directory.addAsset('stronghold.co', {
    code: 'SHX',
    issuer: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH',
});

directory.addAnchor({
    domain: 'naobtc.com',
    website: 'https://naobtc.com/',
    logo: 'naobtc.com',
    color: '#08b5e5',
    displayName: 'NaoBTC',
});

directory.addAsset('naobtc.com', {
    code: 'BTC',
    issuer: 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH',
    instructions: 'https://naobtc.com/#/howto/deposit',
});

directory.addAnchor({
    domain: 'tempo.eu.com',
    website: 'https://tempo.eu.com/',
    logo: 'tempo.eu.com',
    color: '#1b92de',
    displayName: 'TEMPO',
});

directory.addAsset('tempo.eu.com', {
    code: 'EURT',
    issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
});

directory.addAnchor({
    domain: 'sureremit.co',
    website: 'https://sureremit.co',
    logo: 'sureremit.co',
    color: '#363187',
    displayName: 'SureRemit',
});

directory.addAsset('sureremit.co', {
    code: 'RMT',
    issuer: 'GDEGOXPCHXWFYY234D2YZSPEJ24BX42ESJNVHY5H7TWWQSYRN5ZKZE3N',
    instructions: 'https://sureremit.co',
    type: 'token',
});

directory.addAnchor({
    domain: 'ripplefox.com',
    website: 'https://ripplefox.com/anchor/',
    logo: 'ripplefox.com',
    color: '#fc682a',
    displayName: 'RippleFox',
});

directory.addAsset('ripplefox.com', {
    code: 'CNY',
    issuer: 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX',
    instructions: 'Leave your address in the message to seller when you order the item: https://shop109149722.taobao.com',
});

directory.addAnchor({
    domain: 'apay.io',
    website: 'https://apay.io/',
    logo: 'papayame.com',
    color: '#efa344',
    displayName: 'apay.io',
});

directory.addAsset('apay.io', {
    code: 'BTC',
    issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
    instructions: 'https://apay.io/',
});

directory.addAsset('apay.io', {
    code: 'LTC',
    issuer: 'GC5LOR3BK6KIOK7GKAUD5EGHQCMFOGHJTC7I3ELB66PTDFXORC2VM5LP',
    instructions: 'https://apay.io/',
});

directory.addAsset('apay.io', {
    code: 'ETH',
    issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
    instructions: 'https://apay.io/',
});

directory.addAsset('apay.io', {
    code: 'KIN',
    issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
    instructions: 'https://apay.io/',
});

directory.addAsset('apay.io', {
    code: 'LINK',
    issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
    instructions: 'https://apay.io/',
});

directory.addAsset('apay.io', {
    code: 'ZRX',
    issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
    instructions: 'https://apay.io/',
});

directory.addAsset('apay.io', {
    code: 'BAT',
    issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
    instructions: 'https://apay.io/',
});

directory.addAsset('apay.io', {
    code: 'BCH',
    issuer: 'GAEGOS7I6TYZSVHPSN76RSPIVL3SELATXZWLFO4DIAFYJF7MPAHFE7H4',
    instructions: 'https://apay.io/',
});

directory.addAnchor({
    domain: 'mobius.network',
    website: 'https://mobius.network/',
    logo: 'mobius.network',
    color: '#6f39fc',
    displayName: 'Mobius',
});

directory.addAsset('mobius.network', {
    code: 'MOBI',
    issuer: 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH',
    type: 'token',
});

directory.addAnchor({
    domain: 'xirkle.com',
    website: 'https://xirkle.com/',
    logo: 'xirkle.com',
    color: '#ffbb00',
    displayName: 'Xirkle',
});

directory.addAsset('xirkle.com', {
    code: 'XIR',
    issuer: 'GAO4DADCRAHA35GD6J3KUNOB5ELZE5D6CGPSJX2WBMEQV7R2M4PGKJL5',
    type: 'token',
});

directory.addAnchor({
    domain: 'cryptomover.com',
    website: 'https://cryptomover.com/',
    logo: 'cryptomover.com',
    color: '#fbd364',
    displayName: 'Cryptomover',
});

directory.addAsset('cryptomover.com', {
    code: 'CM3',
    issuer: 'GDU2FEL6THGGOFDHHP4I5FHNWY4S2SXYUBCEDB5ZREMD6UFRT4SYWSW2',
});

directory.addAsset('cryptomover.com', {
    code: 'CM10',
    issuer: 'GDBCHKTHJUKDGSIQSTBUXFWVP3QVART5LED6KRZQ5X4Z5WLT4BGYXWCI',
});

directory.addAsset('cryptomover.com', {
    code: 'CMA',
    issuer: 'GBWZHAVWY23QKKDJW7TXLSIHY5EX4NIB37O4NMRKN2SKNWOSE5TEPCY3',
});

directory.addAsset('cryptomover.com', {
    code: 'HKDT',
    issuer: 'GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ',
});

directory.addAsset('cryptomover.com', {
    code: 'CMS',
    issuer: 'GCVBUIXKKLH2DYHZRSLZUIZSVJUL74RTW6FVCCEYB2OE3RH7RVDBPCFG',
});

directory.addAnchor({
    domain: 'flutterwave.com',
    website: 'https://flutterwave.com/',
    logo: 'flutterwave.com',
    color: '#febe12',
    displayName: 'Flutterwave',
});

directory.addAsset('flutterwave.com', {
    code: 'NGN',
    issuer: 'GCC4YLCR7DDWFCIPTROQM7EB2QMFD35XRWEQVIQYJQHVW6VE5MJZXIGW',
});

directory.addAnchor({
    domain: 'cowrie.exchange',
    website: 'https://cowrie.exchange',
    logo: 'cowrie.exchange',
    color: '#2a1c4a',
    displayName: 'Cowrie Exchange',
});

directory.addAsset('cowrie.exchange', {
    code: 'NGNT',
    issuer: 'GAWODAROMJ33V5YDFY3NPYTHVYQG7MJXVJ2ND3AOGIHYRWINES6ACCPD',
    instructions: 'https://cowrie.exchange',
    type: 'token',
});

directory.addAnchor({
    domain: 'coins.asia',
    website: 'https://coins.asia/',
    logo: 'coins.asia',
    color: '#04bcfc',
    displayName: 'coins.asia',
});

directory.addAsset('coins.asia', {
    code: 'PHP',
    issuer: 'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP',
});

directory.addAnchor({
    domain: 'stellarport.io',
    website: 'https://stellarport.io/',
    logo: 'stellarport',
    color: '#00a5ed',
    displayName: 'Stellarport',
});

directory.addAsset('stellarport.io', {
    code: 'BTC',
    issuer: 'GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5',
});

directory.addAsset('stellarport.io', {
    code: 'XRP',
    issuer: 'GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5',
});

directory.addAnchor({
    domain: 'interstellar.exchange',
    website: 'https://interstellar.exchange/',
    logo: 'interstellar',
    color: '#62a9e3',
    displayName: 'Interstellar',
});

directory.addAsset('interstellar.exchange', {
    code: 'ETH',
    issuer: 'GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P',
});

directory.addAnchor({
    domain: 'x.token.io',
    website: 'https://x.token.io/',
    logo: 'x.token',
    color: '#069bee',
    displayName: 'Token X',
});

directory.addAsset('x.token.io', {
    code: 'USD',
    issuer: 'GDSRCV5VTM3U7Y3L6DFRP3PEGBNQMGOWSRTGSBWX6Z3H6C7JHRI4XFJP',
});

directory.addAnchor({
    domain: 'fchain.io',
    website: 'https://fchain.io/',
    logo: 'fchain',
    color: '#1fc785',
    displayName: 'Firefly',
});

directory.addAsset('fchain.io', {
    code: 'ETH',
    issuer: 'GBETHKBL5TCUTQ3JPDIYOZ5RDARTMHMEKIO2QZQ7IOZ4YC5XV3C2IKYU',
});

directory.addAsset('fchain.io', {
    code: 'XCN',
    issuer: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY',
});

directory.addAnchor({
    domain: 'gratz.io',
    website: 'https://gratz.io/',
    logo: 'gratz',
    color: '#f4e73f',
    displayName: 'Gratzio',
});

directory.addAsset('gratz.io', {
    code: 'GRAT',
    issuer: 'GAJ7V3EMD3FRWAPBEJAP7EC4223XI5EACDZ46RFMY5DYOMCIMWEFR5II',
});

directory.addAnchor({
    domain: 'inbot.io',
    website: 'https://inbot.io/',
    logo: 'inbot',
    color: '#ff0045',
    displayName: 'Inbot Ambassador',
});

directory.addAsset('inbot.io', {
    code: 'IN',
    issuer: 'GACVHHIZVSNTE6TVHPUZ2QG5PNLVLFAHFUAD5ZUWZYX2BQEVGBDWJIYA',
});

directory.addAnchor({
    domain: 'blockeq.com',
    website: 'https://blockeq.com/',
    logo: 'blockeq',
    color: '#0084ff',
    displayName: 'BlockEQ',
});

directory.addAsset('blockeq.com', {
    code: 'PTS',
    issuer: 'GBPG7KRYC3PTKHBXQGRD3GMZ5DB4C3D553ZN2ZLH57LBAQIULVY46Z5F',
});

directory.addAnchor({
    domain: 'ximcoin.com',
    website: 'https://ximcoin.com/',
    logo: 'ximcoin.com',
    color: '#000000',
    displayName: 'XIM',
});

directory.addAsset('ximcoin.com', {
    code: 'XIM',
    issuer: 'GBZ35ZJRIKJGYH5PBKLKOZ5L6EXCNTO7BKIL7DAVVDFQ2ODJEEHHJXIM',
    instructions: 'https://ximcoin.com',
    type: 'token',
});

// Pairs involving "fiat" assets
// "Fiat" asset should be counterSelling
directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['CNY', 'ripplefox.com'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['EURT', 'tempo.eu.com'],
});

directory.addPair({
    baseBuying: ['BTC', 'naobtc.com'],
    counterSelling: ['EURT', 'tempo.eu.com'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['HKDT', 'cryptomover.com'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['USD', 'anchorusd.com'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['USD', 'x.token.io'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['NGN', 'flutterwave.com'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['NGNT', 'cowrie.exchange'],
});

directory.addPair({
    baseBuying: ['EURT', 'tempo.eu.com'],
    counterSelling: ['PHP', 'coins.asia'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['PHP', 'coins.asia'],
});

// Pairs involving "BTC"
// "BTC" should be counterSelling
directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['BTC', 'nezly.com'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['BTC', 'naobtc.com'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['BTC', 'apay.io'],
});

directory.addPair({
    baseBuying: ['XLM', 'native'],
    counterSelling: ['BTC', 'stellarport.io'],
});

// Pairs involving XLM
// XLM should be counterSelling
directory.addPair({
    baseBuying: ['WSD', 'thewwallet.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['XIM', 'ximcoin.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['TARI', 'cryptotari.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['FRAS', 'frasindo.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['PEDI', 'pedity.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['NEZ', 'nezly.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['ETH', 'nezly.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['ETH', 'interstellar.exchange'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['ETH', 'fchain.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['XLM', 'stronghold.co'],
    counterSelling: ['XLM', 'native'],
});


directory.addPair({
    baseBuying: ['SHX', 'stronghold.co'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['MOBI', 'mobius.network'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['XRP', 'stellarport.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['XCN', 'fchain.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['GRAT', 'gratz.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['IN', 'inbot.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['PTS', 'blockeq.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['LTC', 'apay.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['ETH', 'apay.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['KIN', 'apay.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['BAT', 'apay.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['ZRX', 'apay.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['LINK', 'apay.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['BCH', 'apay.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['XIR', 'xirkle.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['SLT', 'smartlands.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['REPO', 'repocoin.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['RMT', 'sureremit.co'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['CM3', 'cryptomover.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['CM10', 'cryptomover.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['CMA', 'cryptomover.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['CMS', 'cryptomover.com'],
    counterSelling: ['XLM', 'native'],
});

directory.addPair({
    baseBuying: ['TERN', 'ternio.io'],
    counterSelling: ['XLM', 'native'],
});

directory.addDestination('GCEGERI7COJYNNID6CYSKS5DPPLGCCLPTOSCDD2LG5SJIVWM5ISUPERI', {
    name: 'Superlumen Issuer',
    requiredMemoType: 'MEMO_ID',
});

directory.addDestination('GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM', {
    name: 'Kraken',
    requiredMemoType: 'MEMO_ID',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GCGNWKCJ3KHRLPM3TM6N7D3W5YKDJFL6A2YCXFXNMRTZ4Q66MEMZ6FI2', {
    name: 'Poloniex',
    requiredMemoType: 'MEMO_ID',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GB6YPGW5JFMMP2QB2USQ33EUWTXVL4ZT5ITUNCY3YKVWOJPP57CANOF3', {
    name: 'Bittrex',
    requiredMemoType: 'MEMO_TEXT',
    acceptedAssetsWhitelist: ['XLM-native', 'SLT-smartlands.io', 'MOBI-mobius.network'],
});

directory.addDestination('GB7GRJ5DTE3AA2TCVHQS2LAD3D7NFG7YLTOEWEBVRNUUI2Q3TJ5UQIFM', {
    name: 'BTC38',
    requiredMemoType: 'MEMO_ID',
});

directory.addDestination('GBV4ZDEPNQ2FKSPKGJP2YKDAIZWQ2XKRQD4V4ACH3TCTFY6KPY3OAVS7', {
    name: 'Changelly',
    requiredMemoType: 'MEMO_ID',
});

directory.addDestination('GBR3RS2Z277FER476OFHFXQJRKYSQX4Z7XNWO65AN3QPRUANUASANG3L', {
    name: 'PapayaBot',
    requiredMemoType: 'MEMO_TEXT',
    pathPaymentAccepted: true,
    mergeOpAccepted: true,
});

directory.addDestination('GBTBVILDGCOIK26EPEHYCMKM7J5MTQ4FD5DO37GVTTBP45TVGRAROQHP', {
    name: 'KOINEX',
    requiredMemoType: 'MEMO_ID',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GBGVRE5DH6HGNYNLWQITKRQYGR4PWQEH6MOE5ELPY3I4XJPTZ7CVT4YW', {
    name: 'PapayaSwap',
    requiredMemoType: 'MEMO_TEXT',
});

directory.addDestination('GBQWA6DU6OXHH4AVTFCONQ76LHEWQVZAW7SFSW4PPCAI2NX4MJDZUYDW', {
    name: 'Piiko',
    requiredMemoType: 'MEMO_TEXT',
});

directory.addDestination('GBKTJSNUSR6OCXA5WDWGT33MNSCNQHOBQUBYC7TVS7BOXDKWFNHI4QNH', {
    name: 'Exrates',
    requiredMemoType: 'MEMO_TEXT',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GC4KAS6W2YCGJGLP633A6F6AKTCV4WSLMTMIQRSEQE5QRRVKSX7THV6S', {
    name: 'Indodax',
    requiredMemoType: 'MEMO_TEXT',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GCO2IP3MJNUOKS4PUDI4C7LGGMQDJGXG3COYX3WSB4HHNAHKYV5YL3VC', {
    name: 'Binance',
    requiredMemoType: 'MEMO_ID',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A', {
    name: 'Binance',
    requiredMemoType: 'MEMO_ID',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GBOEEVARKVASOQSSXCAHNTGJTVALJE2QM3AQQ2K3VXACQ6JJREQRJZKB', {
    name: 'OKEX',
    requiredMemoType: 'MEMO_ID',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GDZCEWJ5TVXUTFH6V5CVDQDE43KRXYUFRHKI7X64EWMVOVYYZJFWIFQ2', {
    name: 'AEX',
    requiredMemoType: 'MEMO_ID',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GCXDR4QZ4OTVX6433DPTXELCSEWQ4E5BIPVRRJMUR6M3NT4JCVIDALZO', {
    name: 'GOPAX',
    requiredMemoType: 'MEMO_TEXT',
});

directory.addDestination('GBZ35ZJRIKJGYH5PBKLKOZ5L6EXCNTO7BKIL7DAVVDFQ2ODJEEHHJXIM', {
    name: 'XIM',
    acceptedAssetsWhitelist: ['XLM-native'],
});

directory.addDestination('GCZYLNGU4CA5NAWBAVTHMZH4JXWKP2OUJ6OK3I7XXZCNA5622WUJVLTG', {
    name: 'RMT swap',
    acceptedAssetsWhitelist: ['RMT-old.sureremit.co'],
});

directory.addDestination('GBVUDZLMHTLMZANLZB6P4S4RYF52MVWTYVYXTQ2EJBPBX4DZI2SDOLLY', {
    name: 'Pedity Issuer',
    acceptedAssetsWhitelist: [],
});

directory.addDestination('GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH', {
    name: 'Mobius Issuer',
    acceptedAssetsWhitelist: [],
});

directory.addDestination('GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW', {
    name: 'StellarTerm Inflation',
    acceptedAssetsWhitelist: [],
});

directory.addDestination('GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT', {
    name: 'Lumenaut Inflation',
    acceptedAssetsWhitelist: [],
});

directory.addDestination('GBTCBCWLE6YVTR5Y5RRZC36Z37OH22G773HECWEIZTZJSN4WTG3CSOES', {
    name: 'NaoBTC',
    acceptedAssetsWhitelist: ['BTC-naobtc.com'],
});

directory.addDestination('GDRSWSKJCIB6Z65UA7W5RG62A7M5K3A5IHMED6DYHLPLWLVQCOOGDQ7S', {
    name: 'Gate.io',
    requiredMemoType: 'MEMO_ID',
});

directory.addDestination('GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37', {
    name: 'Coinbase Deposits',
    requiredMemoType: 'MEMO_TEXT',
    acceptedAssetsWhitelist: ['XLM-native'],
});

// Assert that each asset has a trading pair
const remainingAssets = Object.assign({}, directory.assets);

const pairIds = Object.keys(directory.pairs);
pairIds.forEach((pairId) => {
    const pair = directory.pairs[pairId];
    if (pair.baseBuying.code === 'XLM' && pair.baseBuying.issuer === null) {
        delete remainingAssets[`${pair.counterSelling.code}-${pair.counterSelling.issuer}`];
    } else if (pair.counterSelling.code === 'XLM' && pair.counterSelling.issuer === null) {
        delete remainingAssets[`${pair.baseBuying.code}-${pair.baseBuying.issuer}`];
    }
});

const remainingAssetKeys = Object.keys(remainingAssets);
if (remainingAssetKeys.length) {
    throw new Error(`Missing trading pair. Please use addPair() for asset: ${remainingAssetKeys[0]}`);
}

module.exports = directory;
