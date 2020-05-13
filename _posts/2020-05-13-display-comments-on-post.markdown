---
layout: post
title:  "Display comments on your posts"
date:   2020-05-13 12:25:00 -0700
categories: jekyll comments
---
Displaying comments for a post is easy. For a full example of how it works you can look at the [page layout](https://github.com/mwwbot/mwwbot.github.io/blob/master/_layouts/post.html) and [comments.js](https://github.com/mwwbot/mwwbot.github.io/blob/master/assets/js/comments.js) for this site.

To get all of the comments for a specific page use `site.data.comments` and filter it down based on the page id. I also like to sort the comments by date so that I know the order they will be displayed in. Here is a small example with minimal markup.

{% raw %}
```html
{% if site.data.comments %}
  <div id="comments">
    {% assign comments = site.data.comments | where: "page_id", page.id | sort: "date" %}

    {% for comment in comments %}
      <div class="comment">
        <div class="comment-author">
          <img src="https://secure.gravatar.com/avatar/{{ comment.mail_hash }}?s=60&d=mp&r=g" alt="{{ comment.name }}">
          <span class="commenter">{{ comment.name }}</span>
        </div>
        <div class="comment-date">
          <time datetime="{{ comment.date | date_to_xmlschema }}">{{ comment.date | date: "%B %-d, %Y" }}</time>
        </div>
        <div class="comment-content">
          {{ comment.msg | markdownify }}
        </div>
      </div>
    {% endfor %}
  </div>
{% endif %}
```
{% endraw %}

> Note: I highly recommend setting the `timezone` property in your jekyll `_config.yml` file. Without it jekyll will generate the date and times based on the computer. For GitHub pages that is UTC. For my local computer it is `America/Los_Angeles`. This means that the URLs (and page ids) can be different between local development and what is actually hosted on Github Pages. When adding CSS to this site, I spent hours trying to figure out why a comment that showed up as expected on [https://mwwbot.github.io]() didn't show up at all locally. It was because the page id changed and I was filtering based on the wrong value. See the [Jekyll Configuration Options page](https://jekyllrb.com/docs/configuration/options/) for details on how to set timezone.

To allow users to post comments include a small form and javascript that POSTs the results back to your jekyll-aws-comments endpoint. (See [this post](/jekyll/comments/2020/05/12/deploying-jekyll-aws-comments.html) on deploying jekyll-aws-comments to get the URL.)

{% raw %}
```html
<div id="comments-form">
  <div class="row">
    <textarea id="message" name="message" rows="10" placeholder="Join the discussion"></textarea>
  </div>
  <div class="row">
    <input type="text" id="name" placeholder="Your Name"/>
  </div>
  <div class="row">
    <input type="email" id="email" placeholder="Email address"/>
  </div>
  <div class="row">
    <small id="emailHelp">Email is optional. Used for <a href="https://gravatar.com">gravatar</a> images.</small>
  </div>
  <button id="comment-submit" onclick="postComment('{{page.id}}');">Post Comment</button>
</div>
```
{% endraw %}

This example is not a literal HTML `<form>` because I want javascript to process the content and send it to jekyll-aws-comments as JSON instead of encoded as a form. If anyone needs to accept `application/x-www-form-urlencoded` data let me know in a comment and I'm sure I can update the code to accept that as well.

The final step needed is the javascript that takes the comment and posts it back to the lambda.
{% raw %}
```javascript
const url = 'https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/Prod/comment/';

async function postComment(pageId) {
  document.getElementById('comment-submit').disabled = false;

  let msg = document.getElementById('message').value;
  let name = document.getElementById('name').value;
  let email = document.getElementById('email').value;

  let request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      email: email,
      msg: msg,
      pageId: pageId
    })
  };
  await fetch(url, request)
    .then(resp => {
      // Reset the form
      document.getElementById('message').value = '';
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';

      alert('Your comment has been sent to moderators. Check back soon.');
    })
    .catch(err => {
      console.log(err);
      alert('Unable to send your comment right now. Please try again later.');
    })
    .finally(() => {
      document.getElementById('comment-submit').disabled = false;
    });
}
```
{% endraw %}

You can find the javascript file used by this page [here](https://github.com/mwwbot/mwwbot.github.io/blob/master/assets/js/comments.js).

Notice that the body of the request is JSON and includes the following properties:
- `name`: The name the commenter wishes to be displayed.
- `pageId`: The jekyll `page.id` value. This is used in filtering.
- `email`: The comment's email address, if they want their gravatar to be included.
- `msg`: The actual message. This can be written in [markdown](https://commonmark.org/help/) to give more formatting options.

That's it. I spent more time writing the stylesheet to nicely display the comments than I did adding the markup to get them in the first place.
