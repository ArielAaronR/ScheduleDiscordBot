const User = require("../models/user");

/**
 *
 * 1. Get all the users
 * 2. Store the users in an array
 * 3. Make the array "globally" accessible
 * 4. I wanna get the first user in the array that has id = 124981942891
 * 5. User.setStatus("jwfoje");
 *
 */
// var allUsers = User.find()
//   .then(u => u)
//   .catch(err => console.log(err));
function getAllUsersPromise(u) {
  let promise = User.find(u).exec();
  return promise;
}
let allUsers = getAllUsersPromise();
allUsers.then(users => {
  users.forEach(user => {
    user;
  });
});
module.exports = {
  allUsers
};
