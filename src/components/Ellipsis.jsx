const React = window.React = require('react');

export default class Ellipsis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numDots: 1,
    }

    this.tick = () => {
      this.setState({
        numDots: (this.state.numDots % 3) + 1,
      });
      setTimeout(this.tick, 400);
    }
  }
  componentDidMount() {
    this.mounted = true;
    setTimeout(this.tick, 400);
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  render() {
    return <span>{Array(this.state.numDots + 1).join('.')}</span>
  }
}

