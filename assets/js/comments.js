const url = 'https://fnub1sz0b8.execute-api.us-west-2.amazonaws.com/Prod/comment/';

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
      comment: msg,
      pageId: pageId
    })
  };
  await fetch(url, request)
    .then(resp => {
      // Rest the form
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
