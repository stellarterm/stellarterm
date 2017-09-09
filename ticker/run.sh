# serverless --aws-profile stellarterm invoke --function ticker --log --data='{ "image_url": "https://assets-cdn.github.com/images/modules/open_graph/github-mark.png", "key": "github.png"}'
node localRun.js
echo '================================================================'
echo
echo
cat output.json
echo
