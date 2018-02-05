const React = window.React = require('react');

export default class GlobalModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidCatch(error, info) {
    console.error(error);
    this.setState({
    });
  }

  render() {
    return <div className="GlobalModalBackdrop">
      <div className="GlobalModal">
        <div className="GlobalModal__content">
          Are you sure you want to action?
        </div>
        <div className="GlobalModal__navigation">
          <button className="s-button s-button--light">Cancel</button>
          <button className="s-button">Action</button>
        </div>
      </div>
    </div>
  }
}
