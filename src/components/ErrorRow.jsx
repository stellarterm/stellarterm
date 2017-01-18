const React = window.React = require('react');

export default function ErrorRow(props) {
  return <div className="row">
    <div className="row__message row__message--error">
      {props.children}
    </div>
  </div>
}
