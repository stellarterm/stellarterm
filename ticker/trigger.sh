export STELLARTERM_S3_BUCKET="api.stellarterm.com"
serverless --aws-profile stellarterm invoke --function ticker --log --data='{ "image_url": "https://assets-cdn.github.com/images/modules/open_graph/github-mark.png", "key": "github.png"}'
