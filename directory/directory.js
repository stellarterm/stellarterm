// This code is licensed under Apache-2.0.
// It is released AS-IS and without warranty.
// This is simply for informational purposes. The creators of this file does
// not endorse any of this information.

const DirectoryBuilder = require('./DirectoryBuilder');
let directory = new DirectoryBuilder();
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
});

directory.addAsset('nezly.com', {
  code: 'ETH',
  issuer: 'GDGKBRCPW4C3ENNC5C64PE6U33MG52GBKFXOK5P3OSWF74DAOXRXV6OJ',
  instructions: 'https://nezly.com',
});

directory.addAsset('nezly.com', {
  code: 'BTC',
  issuer: 'GDGKBRCPW4C3ENNC5C64PE6U33MG52GBKFXOK5P3OSWF74DAOXRXV6OJ',
  instructions: 'https://nezly.com',
});

directory.addAnchor({
  domain: 'superlumen.org',
  website: 'https://www.superlumen.org/',
  logo: 'superlumen.org',
  color: '#1c4664',
  displayName: 'Superlumens',
});
directory.addAsset('superlumen.org', {
  code: 'SLM',
  issuer: 'GCEGERI7COJYNNID6CYSKS5DPPLGCCLPTOSCDD2LG5SJIVWM5ISUPERI',
  type: 'token',
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
  domain: 'stemchain.io',
  website: 'https://stemchain.io',
  logo: 'stemchain.io',
  color: '#1db5da',
  displayName: 'STEMchain',
});
directory.addAsset('stemchain.io', {
  code: 'STEM',
  issuer: 'GAFXX2VJE2EGLLY3EFA2BQXJADAZTNR7NC7IJ6LFYPSCLE7AI3AK3B3M',
  instructions: 'https://stemchain.io',
  type: 'token',
});

directory.addAnchor({
  domain: 'charnatoken.top',
  website: 'https://charnatoken.top',
  logo: 'charnatoken.top',
  color: '#1c4664',
  displayName: 'Charna Token',
});
directory.addAsset('charnatoken.top', {
  code: 'CHRC',
  issuer: 'GBRPTWEZTUKYM6VJXLHXBFI23M2GSY3TCVIQSZKFQLMOJXH7VPDGKBDP',
});

directory.addAnchor({
  domain: 'irene.energy',
  website: 'https://irene.energy',
  logo: 'irene.energy',
  color: '#38909a',
  displayName: 'TELLUS',
});
directory.addAsset('irene.energy', {
  code: 'TELLUS',
  issuer: 'GBBRMEXJMS3L7Y3DZZ2AHBD545GZ72OAEHHEFKGZAHHASHGWMHK5P6PL',
  instructions: 'https://irene.energy',
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
  code: 'BTC',
  issuer: 'GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG',
  instructions: 'https://stronghold.co/send-receive-bitcoin.html',
});
directory.addAsset('stronghold.co', {
  code: 'ETH',
  issuer: 'GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG',
  instructions: 'https://stronghold.co/send-receive-ethereum.html',
});
directory.addAsset('stronghold.co', {
  code: 'XLM',
  issuer: 'GBSTRH4QOTWNSVA6E4HFERETX4ZLSR3CIUBLK7AXYII277PFJC4BBYOG',
  instructions: 'https://stronghold.co/send-receive-lumens.html',
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
directory.addAsset('naobtc.com', {
  code: 'XEL',
  issuer: 'GAXELY4AOIRVONF7V25BUPDNKZYIVT6CWURG7R2I6NQU26IQSQODBVCS',
  instructions: 'https://naobtc.com/#/howto/deposit',
});

directory.addAnchor({
  domain: 'vcbear.net',
  website: 'https://vcbear.net/',
  logo: 'vcbear.net',
  color: '#0c88b6',
  displayName: 'VCBear',
});
directory.addAsset('vcbear.net', {
  code: 'JPY',
  issuer: 'GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM',
  instructions: 'https://www.vcbear.net/signin',
});
directory.addAsset('vcbear.net', {
  code: 'XRP',
  issuer: 'GA7FCCMTTSUIC37PODEL6EOOSPDRILP6OQI5FWCWDDVDBLJV72W6RINZ',
  instructions: 'https://www.vcbear.net/signin',
});
directory.addAsset('vcbear.net', {
  code: 'BTC',
  issuer: 'GDXTJEK4JZNSTNQAWA53RZNS2GIKTDRPEUWDXELFMKU52XNECNVDVXDI',
  instructions: 'https://www.vcbear.net/signin',
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
  color: '#dc5126',
  displayName: 'SureRemit',
});
directory.addAsset('sureremit.co', {
  code: 'RMT',
  issuer: 'GCVWTTPADC5YB5AYDKJCTUYSCJ7RKPGE4HT75NIZOUM4L7VRTS5EKLFN',
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
  code: 'BCH',
  issuer: 'GAEGOS7I6TYZSVHPSN76RSPIVL3SELATXZWLFO4DIAFYJF7MPAHFE7H4',
  instructions: 'https://apay.io/',
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
  code: 'ICN',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
  instructions: 'https://apay.io/',
});
directory.addAsset('apay.io', {
  code: 'ETH',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
  instructions: 'https://apay.io/',
});
directory.addAsset('apay.io', {
  code: 'BAT',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
  instructions: 'https://apay.io/',
});
directory.addAsset('apay.io', {
  code: 'OMG',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
  instructions: 'https://apay.io/',
});
directory.addAsset('apay.io', {
  code: 'REP',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
  instructions: 'https://apay.io/',
});
directory.addAsset('apay.io', {
  code: 'ZRX',
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
  code: 'MTL',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
  instructions: 'https://apay.io/',
});
directory.addAsset('apay.io', {
  code: 'SALT',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
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
  domain: 'collective21.org',
  website: 'https://collective21.org/',
  logo: 'collective21.org',
  color: '#3abfce',
  displayName: 'Collective21',
});
directory.addAsset('collective21.org', {
  code: 'SEED',
  issuer: 'GDPFSEBZO2W4TLWZO7FIMMG3QONHXYVF6LUULI6HUJS6PJLE4TRZEXLF',
});

directory.addAnchor({
  domain: 'liquido.i-server.org',
  website: 'https://liquido.i-server.org/',
  logo: 'liquido.i-server.org',
  displayName: 'Liquido',
});
directory.addAsset('liquido.i-server.org', {
  code: 'XLQ',
  issuer: 'GD2RRX6BKVTORZ6RIMBLWFVUOAYOLTS2QFJQUQPXLI3PBHR3TMLQNGZX',
});

directory.addAnchor({
  domain: 'moni.com',
  website: 'https://moni.com/',
  logo: 'moni.com',
  displayName: 'MONI',
});
directory.addAsset('moni.com', {
  code: 'EUR',
  issuer: 'GAKBPBDMW6CTRDCXNAPSVJZ6QAN3OBNRG6CWI27FGDQT2ZJJEMDRXPKK',
});

directory.addAnchor({
  domain: 'tonaira.com',
  website: 'https://tonaira.com/',
  logo: 'tonaira.com',
  color: '#82be37',
  displayName: 'Tonaira',
});
directory.addAsset('tonaira.com', {
  code: 'NGN',
  issuer: 'GCLRUZDCWBHS7VIFCT43BARPP63BHR32HMEVKXYQODA5BU6SIGFK4HL2',
});

directory.addAnchor({
  domain: 'equid.co',
  website: 'https://equid.co/',
  logo: 'equid.co',
  displayName: 'eQuid',
});
directory.addAsset('equid.co', {
  code: 'EQD',
  issuer: 'GCGEQJR3E5BVMQYSNCHPO6NPP3KOT4VVZHIOLSRSNLE2GFY7EWVSLLTN',
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
  domain: 'golix.io',
  website: 'https://golix.io/',
  logo: 'golix.io',
  displayName: 'Golix',
});
directory.addAsset('golix.io', {
  code: 'USD',
  issuer: 'GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R',
});
directory.addAsset('golix.io', {
  code: 'BTC',
  issuer: 'GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R',
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
  issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
});
directory.addAsset('cryptomover.com', {
  code: 'CM10',
  issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
});
directory.addAsset('cryptomover.com', {
  code: 'CME',
  issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
});
directory.addAsset('cryptomover.com', {
  code: 'CM3x2',
  issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
});
directory.addAsset('cryptomover.com', {
  code: 'HKDC',
  issuer: 'GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',
});

directory.addAnchor({
  domain: 'thefutbolcoin.io',
  website: 'https://thefutbolcoin.io/',
  logo: 'thefutbolcoin.io',
  color: '#4b914e',
  displayName: 'TFC',
});
directory.addAsset('thefutbolcoin.io', {
  code: 'TFC',
  issuer: 'GDS3XDJAA4VY6MJYASIGSIMPHZ7AQNZ54RKLWT7MWCOU5YKYEVCNLVS3',
});

// Pairs involving "fiat" assets
// "Fiat" asset should be counterSelling
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['CNY', 'ripplefox.com'],
});
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['JPY', 'vcbear.net'],
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
  counterSelling: ['HKDC', 'cryptomover.com'],
});
directory.addPair({
  baseBuying: ['EURT', 'tempo.eu.com'],
  counterSelling: ['PHP', 'coins.asia'],
});
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['PHP', 'coins.asia'],
});
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['NGN', 'flutterwave.com'],
});
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['NGN', 'tonaira.com'],
});
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['EUR', 'moni.com'],
});
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['USD', 'golix.io'],
});

// Pairs involving "BTC"
// "BTC" should be counterSelling
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['BTC', 'stronghold.co'],
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
  counterSelling: ['BTC', 'vcbear.net'],
});
directory.addPair({
  baseBuying: ['XLM', 'native'],
  counterSelling: ['BTC', 'golix.io'],
});

// Pairs involving XLM
// XLM should be counterSelling
directory.addPair({
  baseBuying: ['SLM', 'superlumen.org'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['XRP', 'vcbear.net'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['TELLUS', 'irene.energy'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['TFC', 'thefutbolcoin.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['STEM', 'stemchain.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['ETH', 'stronghold.co'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['XLM', 'stronghold.co'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['XEL', 'naobtc.com'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['MOBI', 'mobius.network'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['CHRC', 'charnatoken.top'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['BCH', 'apay.io'],
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
  baseBuying: ['BAT', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['ICN', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['OMG', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['REP', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['ZRX', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['KIN', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['LINK', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['MTL', 'apay.io'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['SALT', 'apay.io'],
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
  baseBuying: ['EQD', 'equid.co'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['SEED', 'collective21.org'],
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
  baseBuying: ['CME', 'cryptomover.com'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['CM3x2', 'cryptomover.com'],
  counterSelling: ['XLM', 'native'],
});
directory.addPair({
  baseBuying: ['XLQ', 'liquido.i-server.org'],
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
  acceptedAssetsWhitelist: ['XLM-native'],
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
  name: 'BitcoinIndonesia',
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

// Assert that each asset has a trading pair
let remainingAssets = Object.assign({}, directory.assets);
for (let pairId in directory.pairs) {
  let pair = directory.pairs[pairId];
  if (pair.baseBuying.code === 'XLM' && pair.baseBuying.issuer === null) {
    delete remainingAssets[pair.counterSelling.code + '-' + pair.counterSelling.issuer];
  } else if (pair.counterSelling.code === 'XLM' && pair.counterSelling.issuer === null) {
    delete remainingAssets[pair.baseBuying.code + '-' + pair.baseBuying.issuer];
  }
}
let remainingAssetKeys = Object.keys(remainingAssets);
if (remainingAssetKeys.length) {
  throw new Error('Missing trading pair. Please use addPair() for asset: ' + remainingAssetKeys[0]);
}

module.exports = directory;
