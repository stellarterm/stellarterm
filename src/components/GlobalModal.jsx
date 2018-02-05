const React = window.React = require('react');

export default class GlobalModal extends React.Component {
  constructor(props) {
    super(props);
    this.unsub = this.props.d.modal.event.sub(() => {this.forceUpdate()});
    this.state = {
    };
  }
  componentWillUnmount() {
    this.unsub();
  }

  componentDidCatch(error, info) {
    this.setState({
    });
  }

  render() {
    let d = this.props.d;
    return <div className={'GlobalModalBackdrop' + (d.modal.active ? '' : ' is-hidden')}>
      <div className="GlobalModal">
        <div className="GlobalModal__content">
          Are you sure you want to finish?
        </div>
        <div className="GlobalModal__navigation">
          <button className="s-button s-button--light" onClick={() => {d.modal.handlers.cancel()}}>Cancel</button>
          <button className="s-button" onClick={() => {d.modal.handlers.finish()}}>Finish</button>
        </div>
      </div>
    </div>
  }
}
