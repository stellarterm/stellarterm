if [ -z "$STELLARTERM_S3_BUCKET" ]; then
    echo "Environment variable STELLARTERM_S3_BUCKET must be set. Take a look at setEnvironment.example.sh for an example."
    echo "Run: source setEnvironment.sh"
    exit 1
fi
if [ -z "$STELLARTERM_AWS_PROFILE" ]; then
    echo "Environment variable STELLARTERM_AWS_PROFILE must be set. Take a look at setEnvironment.example.sh for an example."
    echo "Run: source setEnvironment.sh"
    exit 1
fi

serverless --aws-profile $STELLARTERM_AWS_PROFILE remove
