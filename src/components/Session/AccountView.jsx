const React = window.React = require('react');

export default function AccountView({session}) {
  return <div>Logged in as: {session.accountId}</div>
}
