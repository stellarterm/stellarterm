const React = window.React = require('react');

export default class RemoveTrustLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'ready', // Can be: ready, pending, or error
    };

    // TODO: If we successfully remove trust, then React gets unhappy because this element disappears
    // Warning: Can only update a mounted or mounting component. This usually means you called setState, replaceState, or forceUpdate on an unmounted component. This is a no-op.
    // Please check the code for the BalancesTable component.
    this.handleRemoveTrust = e => {
      e.preventDefault();
      this.props.d.session.handlers.removeTrust(this.props.balance.code, this.props.balance.issuer)
      .then(bssResult => {
        if (bssResult.status === 'finish') {
          this.setState({status: 'pending'});
          return bssResult.serverResult
          .then(res => {
            console.log('Successfully removed trust', res);
          })
          .catch(err => {
            console.log('Errored when removing trust', err);
            this.setState({
              status: 'error',
            })
          })
        }
      })
    }
  }
  render() {
    let balance = this.props.balance;
    if (balance.balance === '0.0000000') {
      if (this.state.status === 'ready') {
        return <a className="BalancesTable__row__removeLink" onClick={this.handleRemoveTrust}>Remove asset</a>
      } else if (this.state.status === 'pending') {
        return <span className="BalancesTable__row__removeLink">Removing asset ...</span>
      } else {
        return <a className="BalancesTable__row__removeLink" onClick={this.handleRemoveTrust}>Errored when removing asset</a>
      }
    } else {
      return <span className="BalancesTable__row__removeLink">Asset can be removed when balance is 0</span>
    }
  }
}
