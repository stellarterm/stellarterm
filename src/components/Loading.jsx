const React = window.React = require('react');

export default class Loading extends React.Component {
  render() {
    let loadingSizeClass = '';
    if (this.props.size === 'large') {
      loadingSizeClass = ' Loading--large';
    }
    return <div className={'Loading' + loadingSizeClass}>
      <p className="Loading__message">{this.props.children}</p>
    </div>
  }
}

