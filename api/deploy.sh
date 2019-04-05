if [ -z "$STELLARTERM_S3_BUCKET" ]; then
    printf "\033[1;31mERROR: \033[0;31mEnvironment variable STELLARTERM_S3_BUCKET must be set.\033[0;33m \nTake a look at setEnvironment.example.sh for an example.\n"
    printf "Run: source setEnvironment.sh\033[0m\n"
    exit 1
fi
if [ -z "$STELLARTERM_AWS_PROFILE" ]; then
    printf "\033[1;31mERROR: \033[0;31mEnvironment variable STELLARTERM_AWS_PROFILE must be set.\033[0;33m Take a look at setEnvironment.example.sh for an example.\n"
    echo "Run: source setEnvironment.sh\033[0m\n"
    exit 1
fi

(cd ./../directory/ && ./checkBuild.sh)
if [ $? == 1 ]
then
    exit 1
fi

export BRANCH="$(git branch | grep \* | cut -d ' ' -f2)"

if [ $BRANCH != "master" ] && [ $BRANCH != "staging" ]
then
    printf "\033[1;31mERROR: \033[0;31mYou must be at staging or master branch.\033[0m\n"
    exit 1
fi

if [ $BRANCH == "master" ]
then
    BRANCH="dev"
fi

printf "\033[1;33mStarting API deploy\n"
printf "Stage for deploy is $BRANCH\033[0m\n"

serverless --aws-profile $STELLARTERM_AWS_PROFILE deploy
# serverless --aws-profile $STELLARTERM_AWS_PROFILE deploy function -f ticker
