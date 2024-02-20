const http = require('http');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const url = require('url');
const Router = require('router');
const bodyParser = require('body-parser');
const fs = require('fs');
// State holding variables
let goals = [];
let user = {};
let users = [];
let categories = [];

const PORT = process.env.PORT || 8080;

// Setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

// This function is a bit simpler...
const server = http.createServer((req, res) => {
  res.writeHead(200);
  Router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate categories  
  categories = JSON.parse(fs.readFileSync("initial-data/categories.json","utf-8"));

  //populate goals
  goals = JSON.parse(fs.readFileSync("initial-data/goals.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  // hardcode "logged in" user
  user = users[0];
});

// Notice how much cleaner these endpoint handlers are...
myRouter.get('/v1/goals', function(request,response) {
  // Get our query params from the query string
  const queryParams = queryString.parse(url.parse(request.url).query)

  // TODO: Do something with the query params

  // Return all our current goal definitions (for now)
  return response.end(JSON.stringify(goals));
});

// See how i'm not having to build up the raw data in the body... body parser just gives me the whole thing as an object.
// See how the router automatically handled the path value and extracted the value for me to use?  How nice!
myRouter.post('/v1/me/goals/:goalId/accept', function(request,response) {
  // Find goal from id in url in list of goals
  let goal = goals.find((goal)=> {
    return goal.id == request.params.goalId
  })
  // Add it to our logged in user's accepted goals
  user.acceptedGoals.push(goal); 
  // No response needed other than a 200 success
  return response.end();
});

myRouter.post('/v1/me/goals/:goalId/challenge/:userId', function(request,response) {
  // Find goal from id in url in list of goals
  let goal = goals.find((goal)=> {
    return goal.id == request.params.goalId
  })
  // Find the user who is being challenged in our list of users
  let challengedUser = users.find((user)=> {
    return user.id == request.params.userId
  })
  // Make sure the data being changed is valid
  if (!goal) {
    response.statusCode = 400
    return response.end("No goal with that ID found.")
  }
  // Add the goal to the challenged user
  challengedUser.challengedGoals.push(goal); 
  // No response needed other than a 200 success
  return response.end();
});

module.exports = server;