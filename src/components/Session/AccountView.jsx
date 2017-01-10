const React = window.React = require('react');

export default function AccountView({session}) {
  return <div>
    <p>Logged in as: {session.account.accountId}</p>
  </div>
}
