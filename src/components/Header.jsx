const React = window.React = require('react');

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.listenId = this.props.d.listenSession(() => {
      this.forceUpdate();
    });
  }
  componentWillUnmount() {
    this.props.d.unlistenSession(this.listenId);
  }
  render() {
    let networkBar;
    if (!this.props.network.isDefault) {
      networkBar = <div className="so-back HeaderNetworkBarBack">
        <div className="so-chunk">
          <div className="HeaderNetworkBar">
            <span>Horizon url: <strong>{this.props.network.horizonUrl}</strong></span>
            <span>Network passphrase: <strong>{this.props.network.networkPassphrase}</strong></span>
          </div>
        </div>
      </div>
    }
    return <div className="HeaderBackBack">
      {networkBar}
      <div className="so-back HeaderBack">
        <div className="so-chunk Header">
          <nav className="Header__nav">
            <a className="Header__nav__item Header__nav__item--logo" href="#">StellarTerm</a>
            <a className="Header__nav__item" href="#exchange">Exchange</a>
            <a className="Header__nav__item" href="#markets">Markets</a>
            <a className="Header__nav__item" href="#account">Account</a>
          </nav>
          <span className="Header__version">v{window.stBuildInfo.version}</span>
        </div>
      </div>
    </div>
  }
}

