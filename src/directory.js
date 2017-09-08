// This is a directory that maps issuer account IDs to their issuers
import _ from 'lodash';
import logos from './logos';
import DirectoryBuilder from './DirectoryBuilder';

let directory = new DirectoryBuilder();


directory.addAnchor({
  domain: 'stellarterm.com',
  website: 'https://stellarterm.com/',
  logo: 'stellarterm.com',
});
directory.addAsset('stellarterm.com', {
  code: 'DEMO',
  issuer: 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE',
});

directory.addAnchor({
  domain: 'naobtc.com',
  website: 'https://naobtc.com/',
  logo: 'naobtc.com',
});
directory.addAsset('naobtc.com', {
  code: 'BTC',
  issuer: 'GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH',
});


directory.addAnchor({
  domain: 'coins.asia',
  website: 'https://coins.asia/',
  logo: 'coins.asia',
});
directory.addAsset('coins.asia', {
  code: 'PHP',
  issuer: 'GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP',
});


directory.addAnchor({
  domain: 'tempo.eu.com',
  website: 'https://tempo.eu.com/',
  logo: 'tempo.eu.com',
});
directory.addAsset('tempo.eu.com', {
  code: 'EURT',
  issuer: 'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S',
});


directory.addAnchor({
  domain: 'moni.com',
  website: 'https://moni.com/',
  logo: 'moni.com',
});
directory.addAsset('moni.com', {
  code: 'EUR',
  issuer: 'GAKBPBDMW6CTRDCXNAPSVJZ6QAN3OBNRG6CWI27FGDQT2ZJJEMDRXPKK',
});


directory.addAnchor({
  domain: 'ripplefox.com',
  website: 'https://ripplefox.com/anchor/',
  logo: 'ripplefox.com',
});
directory.addAsset('ripplefox.com', {
  code: 'CNY',
  issuer: 'GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX',
});

directory.addAnchor({
  domain: 'mobius.network',
  website: 'https://mobius.network/',
  logo: 'mobius.network',
});
directory.addAsset('mobius.network', {
  code: 'MOBI',
  issuer: 'GDCIUCGL7VEMMF6VYJOW75KQ5ZCLHAQBRM6EPFTKCRWUYVUOOYQCKC5A',
});

directory.addAnchor({
  domain: 'gft.network',
  website: 'https://gft.network/',
  logo: 'gft.network',
});
directory.addAsset('gft.network', {
  code: 'GFT',
  issuer: 'GAAZUE4PKMKLA7QC2MPUIUXY7BZK2WUCK7Q5EELSDLK4FE3X4DZTSCKN',
});

directory.addAnchor({
  domain: 'collective21.org',
  website: 'https://collective21.org/',
  logo: 'collective21.org',
});
directory.addAsset('collective21.org', {
  code: 'SEED',
  issuer: 'GDPFSEBZO2W4TLWZO7FIMMG3QONHXYVF6LUULI6HUJS6PJLE4TRZEXLF',
});



directory.addAnchor({
  domain: 'tonaira.com',
  website: 'https://tonaira.com/',
  logo: 'tonaira.com',
});
directory.addAsset('tonaira.com', {
  code: 'NGN',
  issuer: 'GCLRUZDCWBHS7VIFCT43BARPP63BHR32HMEVKXYQODA5BU6SIGFK4HL2',
});


directory.addAnchor({
  domain: 'equid.co',
  website: 'https://equid.co/',
  logo: 'equid.co',
});
directory.addAsset('equid.co', {
  code: 'EQD',
  issuer: 'GCGEQJR3E5BVMQYSNCHPO6NPP3KOT4VVZHIOLSRSNLE2GFY7EWVSLLTN',
});


directory.addAnchor({
  domain: 'liquido.i-server.org',
  website: 'https://liquido.i-server.org/',
  logo: 'liquido.i-server.org',
});
directory.addAsset('liquido.i-server.org', {
  code: 'XLQ',
  issuer: 'GD2RRX6BKVTORZ6RIMBLWFVUOAYOLTS2QFJQUQPXLI3PBHR3TMLQNGZX',
});

directory.addAnchor({
  domain: 'bitcoinfundi.com',
  website: 'https://bitcoinfundi.com/',
  logo: 'bitcoinfundi.com',
});
directory.addAsset('bitcoinfundi.com', {
  code: 'USD',
  issuer: 'GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R',
});
directory.addAsset('bitcoinfundi.com', {
  code: 'BTC',
  issuer: 'GCYK67DDGBOANS6UODJ62QWGLEB2A7JQ3XUV25HCMLT7CI23PMMK3W6R',
});

directory.addAnchor({
  domain: 'vcbear.net',
  website: 'https://vcbear.net/',
  logo: 'vcbear.net',
});
directory.addAsset('vcbear.net', {
  code: 'JPY',
  issuer: 'GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM',
});
directory.addAsset('vcbear.net', {
  code: 'XRP',
  issuer: 'GA7FCCMTTSUIC37PODEL6EOOSPDRILP6OQI5FWCWDDVDBLJV72W6RINZ',
});
directory.addAsset('vcbear.net', {
  code: 'BTC',
  issuer: 'GDXTJEK4JZNSTNQAWA53RZNS2GIKTDRPEUWDXELFMKU52XNECNVDVXDI',
});



directory.addAnchor({
  domain: 'cryptomover.com',
  website: 'https://cryptomover.com/',
  logo: 'cryptomover.com',
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
  domain: 'readycash.com.ng',
  website: 'https://readycash.com.ng/',
  logo: 'readycash.com.ng',
});
directory.addAsset('readycash.com.ng', {
  code: 'NGN',
  issuer: 'GA3TKVAAVRPSOO7YAKCTFA2Z22PJMFT2YWNJLNMTIVLVLEPLE2SZIRXU',
});


directory.addAnchor({
  domain: 'btc.papayame.com',
  website: 'https://btc.papayame.com/',
  logo: 'papayame.com',
});
directory.addAsset('btc.papayame.com', {
  code: 'BTC',
  issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
});

directory.addAnchor({
  domain: 'ltc.papayame.com',
  website: 'https://ltc.papayame.com/',
  logo: 'papayame.com',
});
directory.addAsset('ltc.papayame.com', {
  code: 'LTC',
  issuer: 'GC5LOR3BK6KIOK7GKAUD5EGHQCMFOGHJTC7I3ELB66PTDFXORC2VM5LP',
});

directory.addAnchor({
  domain: 'erc20.papayame.com',
  website: 'https://erc20.papayame.com/',
  logo: 'papayame.com',
});
directory.addAsset('erc20.papayame.com', {
  code: 'ICN',
  issuer: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
});


directory.addDestination('GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM', {
  name: 'Kraken',
  requiredMemoType: 'MEMO_ID',
});
directory.addDestination('GCGNWKCJ3KHRLPM3TM6N7D3W5YKDJFL6A2YCXFXNMRTZ4Q66MEMZ6FI2', {
  name: 'Poloniex',
  requiredMemoType: 'MEMO_ID',
});
directory.addDestination('GB6YPGW5JFMMP2QB2USQ33EUWTXVL4ZT5ITUNCY3YKVWOJPP57CANOF3', {
  name: 'Bittrex',
  requiredMemoType: 'MEMO_ID',
});
directory.addDestination('GB7GRJ5DTE3AA2TCVHQS2LAD3D7NFG7YLTOEWEBVRNUUI2Q3TJ5UQIFM', {
  name: 'BTC38',
  requiredMemoType: 'MEMO_ID',
});
directory.addDestination('GBV4ZDEPNQ2FKSPKGJP2YKDAIZWQ2XKRQD4V4ACH3TCTFY6KPY3OAVS7', {
  name: 'Changelly',
  requiredMemoType: 'MEMO_ID',
});


let specialData = {
  'Stellar Network': {
    name: 'Stellar Network',
    assets: [
      {
        code: 'XLM',
        issuer: null,
      }
    ],
    logo: logos['stellar'],
  },
  'unknown': {
    name: 'unknown',
    logo: logos['unknown'],
  }
};

export default directory;
