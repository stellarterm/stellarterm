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

BRANCH="$(git branch | grep \* | cut -d ' ' -f2)"

if [ $BRANCH != "master" ] && [ $BRANCH != "staging" ]
then
    echo "You must be at staging or master branch."
    exit 1
fi

if [ $BRANCH == "master" ]
then
    BRANCH="dev"
fi

echo "Starting API deploy"
echo "Stage for deploy is $BRANCH"

serverless --aws-profile $STELLARTERM_AWS_PROFILE deploy
# serverless --aws-profile $STELLARTERM_AWS_PROFILE deploy function -f ticker
