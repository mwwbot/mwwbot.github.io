---
layout: post
title:  "Deploying jekyll-aws-comments to AWS"
date:   2020-05-12 17:12:00 -0700
categories: jekyll comments
---
The [Jekyll AWS Comments](https://github.com/mww/jekyll-aws-comments) program is laid out as an [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/) application. This means that once you have setup SAM, deploying it is quick and easy.

Follow the instructions on the [SAM website](https://aws.amazon.com/serverless/sam/) to install the command line tool. You will also need to set up an AWS account. jekyll-aws-comments uses AWS services that are part of the [AWS free tier](https://aws.amazon.com/free/?all-free-tier.sort-by=item.additionalFields.SortRank&all-free-tier.sort-order=asc), so unless your site has extremely high traffic the AWS usage should be free. The exception to do this is [API Gateway](https://aws.amazon.com/api-gateway/pricing/) which is free for 1 million requests / month for the first 12 months. After those 12 months it costs $1 for 1 million requests / month. So it is inexpensive.

Next download jekyll-aws-comments
```bash
$ git clone git@github.com:mww/jekyll-aws-comments.git
```

Copy the `example_config.json` file in create-pull-request to `config.json`.
```bash
$ cp jekyll-aws-comments/create-pull-request/example_config.json jekyll-aws-comments/create-pull-request/config.json
```

Then edit `config.json`.
```json
{
  "owner": "mwwbot",
  "repo": "mww.github.io",
  "base": "master",
  "credentials": {
    "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

- `owner` is the github user that created the repository.
- `repo` is the name of the repository.
- `base` is the branch to commit comments to, typically this is `master`.

For credentials you will need to create a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line). Follow the instructions on that page and include the token in your config.json file.

> Note: If you want to get notifications when jekyll-aws-comments creates a pull request the token needs to be for a user other than the repository owner. For this I created a bot account ([bot accounts](https://help.github.com/en/github/getting-started-with-github/types-of-github-accounts) are allowed by GitHub). For example my primary GitHub account is [mww](https://www.github.com/mww) and I created a second account named [mwwbot](https://www.github.com/mwwbot). Since my GitHub pages repository is private I also had to make mwwbot a collaborator on the repo. So `owner`, `repo`, and `base` are for the repo owner and `token` is from the bot account.

Once your `config.json` file is complete you just need to run some `sam` commands from the command line.
```bash
$ sam build
$ sam deploy --guided
```

The sam deploy --guided command will walk you through the deployment process asking you a few questions. A very important parameter it will ask you about is CorsAllowOriginParameter. You can set this parameter to your domain so that requests from other domains will be rejected. The default value is \'*\' which allows all sites to send requests.

```
Parameter CorsAllowOriginParameter ['*']: 'https://mwwbot.github.io'
```

For the CorsAllowOriginParameter to be valid the site must be surrounded by single quote (\') marks.

At the end of the deployment process SAM will output some information about the deployment including the URL that you can use to post comments.

```
CloudFormation outputs from deployed stack
-----------------------------------------------------------------------------------------------------------------------------------------
Outputs
-----------------------------------------------------------------------------------------------------------------------------------------
Key                 CommentApi
Description         API Gateway endpoint URL for Prod stage
Value               https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/Prod/comment/
-----------------------------------------------------------------------------------------------------------------------------------------
```

Now you are running your own version of jekyll-aws-comments! Simply post comments to the URL output from the `sam deploy` step and you will start getting pull requests for each new comment.

Have I made any mistakes? Can I make one of the steps more clear? Let me know in the comments.
