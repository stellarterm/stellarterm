const React = window.React = require('react');

export default function Generic(props) {
  let header;
  if (props.title) {
    header = <div className="island__header">
      {props.title}
    </div>
  }
  return <div className="so-back islandBack islandBack--t">
    <div className="island">
      {header}
      <div className="Generic__content">
        {props.children}
      </div>
    </div>
  </div>
}
