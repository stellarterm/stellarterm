# serverless --aws-profile stellarterm invoke --function ticker --log --data='{ "image_url": "https://assets-cdn.github.com/images/modules/open_graph/github-mark.png", "key": "github.png"}'
rm output/v1/ticker.json
node localRun.js
echo '================================================================'
echo
echo
cat output/v1/ticker.json
echo
