const React = window.React = require('react');

const TOTAL_DOTS = 3;
export default class Ellipsis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleDots: 0, // 0 indexed
    }

    this.tick = () => {
      if (this.mounted) {
        this.setState({
          visibleDots: (this.state.visibleDots + 1) % (TOTAL_DOTS + 1),
        });
        setTimeout(this.tick, 300);
      }
    }
  }
  componentDidMount() {
    this.mounted = true;
    setTimeout(this.tick, 300);
  }
  componentWillUnmount() {
    this.mounted = false;
  }
  render() {
    let dots = [];
    for (let i = 0; i < TOTAL_DOTS; i++) {
      dots.push(<span key={i} className={'Ellipsis__dot' + (i >= this.state.visibleDots ? ' is-hidden' : '')}>.</span>)
    }
    return <span className="Ellipsis">{dots}</span>
  }
}

