This file is meant for informational purposes only/

Changes up to November 2017:

  Visitors
    - Cloudflare now reports 300+ unique visitors a day

  Design
    - Redesigned landing page
    - Asset cards now color coded
    - Asset cards take up less space while using a bigger font size for overview info

  UI/UX
    - Minimum balance is calculated and explained to the user
    - Minimum balance checks in multiple parts of the app
    - Simplified balances page
    - Improved order placement window to be more intuitive
    - Improved spacing and precision in depth tables
    - Improved error message when offer creation fails

  New account
    - New information display when an account is not yet created
    - Tool to create a keypair

  Ticker
    - New ticker backend process to generate information about the Stellar network
    - Estimates price, volume, and "activity" of each asset
    - Ticker built on AWS "serverless" technology with high uptime

  Continuous Integration and testing
    - Automated CI testing using Chrome to check that critical parts of the app are functional
    - Added directory building check to CI to ensure the directory files are in sync

  Markets page
    - Listing of assets are sorted based on volume and market depth
    - Showing assets instead of pairs to make things easier to see

  Directory
    - Directory refactored into a separate standalone module
    - Directory added to npm: https://www.npmjs.com/package/stellarterm-directory
    - Oriented market pairs to be shown more consistently
    - Added many new assets and defined new guidelines on directory inclusion

  Optimizations
    - Removed ubuntu font in exchange for a main font with monospaced numbers
    - Upgraded to newer stellar-sdk and fixed deprecation issues

  Bugs
    - Many small bugs squashed
