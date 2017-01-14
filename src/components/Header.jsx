const React = window.React = require('react');

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <ul>
      <li>
        <a href="#">Stellarterm</a>
      </li>
      <li>
        <a href="#account">Account</a>
      </li>
      <li>
        <a href="#trading">Trading</a>
      </li>
    </ul>
  }
}

