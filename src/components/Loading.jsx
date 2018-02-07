const React = window.React = require('react');

export default class Loading extends React.Component {
  render() {
    let loadingClass = 'Loading';
    if (this.props.size === 'large') {
      loadingClass += ' Loading--large';
    }

    // Use darker for when text contains content that should be legible
    if (this.props.darker) {
      loadingClass += ' Loading--darker';
    }

    if (this.props.left) {
      loadingClass += ' Loading--left';
    }

    return <div className={loadingClass}>
      <p className="Loading__message">{this.props.children}</p>
    </div>
  }
}

