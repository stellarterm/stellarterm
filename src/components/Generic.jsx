const React = window.React = require('react');

export default function Generic(props) {
  let header;
  if (props.title) {
    header = <div className="island__header">
      {props.title}
    </div>
  }
  let containerClassName = 'so-back islandBack'
  if (!props.noTopPadding) {
    containerClassName += ' islandBack--t';
  }
  return <div className={containerClassName}>
    <div className="island">
      {header}
      <div className="Generic__content">
        {props.children}
      </div>
    </div>
  </div>
}
