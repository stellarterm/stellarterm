# StellarTerm API
The StellarTerm comes with APIs to compile Stellar data to make it easier and faster for clients to consume.

See it in action: https://api.stellarterm.com/v1/ticker.json

## Setup
First, set up Serverless. Docs at: https://github.com/serverless/serverless

```sh
# install nvm (Node version manager): https://github.com/creationix/nvm#installation
nvm install 6.10
nvm use 6.10
npm install -g serverless
```

### Locally test
```
./testTicker.sh
```

## AWS setup
NOTE: You should do this on a new AWS account since the clean.sh is destructive and serverless wants full admin powers. Developers of StellarTerm are not resposible for any damage done to your AWS account as this project is licensed under the Apache-2.0 license and is provided "AS-IS" without warranty.

First, Get AWS IAM keys for the account you want to run the StellarTerm API on.

```
# Install the AWS cli
# If you can't use brew: https://docs.aws.amazon.com/cli/latest/userguide/installing.html
brew install awscli

# Save your AWS IAM keys into a profile using the aws configuration wizard
aws configure --profile stellarterm
```

Create a S3 bucket on your AWS account using the AWS management UI. Then, copy `setEnvironment.example.sh` to `setEnvironment.sh` and make your changes necessary.

### Usage
```sh
nvm use 6.10
source setEnvironment.sh
./deploy.sh
```

## Scripts explained:
All scripts use the AWS profile `stellarterm`
- `clean.sh`: Deletes all AWS Lambda _stuffs_ from account configured
- `deploy.sh`: Builds and deploys to AWS Lambda. It also starts the scheduling
- `trigger.sh`: Trigger the job remotely
- `getLogs.sh`: Gets ALL the logs
- `testTrigger.sh`: Run the ticker code locally for testing and development
