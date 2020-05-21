var prompt = require('prompt');

//
// Start the prompt
//

//
// Get two properties from the user: username and email
//
(async () => {
  prompt.start();
  const {username, email} = await prompt.get(['username', 'email']);
  console.log('  username: ' + username);
  console.log('  email: ' + email);
})();
