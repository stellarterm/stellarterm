const React = window.React = require('react');

export default function MessageRow(props) {
  return <div className="row">
    <div className="row__message">
      {props.children}
    </div>
  </div>
}
