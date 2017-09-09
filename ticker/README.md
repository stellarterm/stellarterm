# StellarTerm Ticker API



## Setup
First, set up Serverless. Docs at: https://github.com/serverless/serverless

NOTE: You should do this on a new AWS account since the clean.sh is destructive.

```sh
# install nvm
nvm install 6.10
nvm use 6.10
npm install -g serverless

aws configure --profile user2

```

## Usage
```sh
nvm use 6.10
./deploy.sh
```

## Locally test
```
./run.sh
```

## Scripts explained:
All scripts use the AWS profile `stellarterm`
- clean.sh: Deletes all AWS Lambda _stuffs_ from account configured
- deploy.sh: Builds and deploys to AWS Lambda. It also starts the scheduling
- run.sh: Run the ticker code locally for testing and development
- trigger.sh: Trigger the job remotely
- getLogs.sh: Gets ALL the logs
