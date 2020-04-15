// middleware.js
const jwt = require('jsonwebtoken');
const config = require('config');
const secret= config.get('jwt.secret');

const withAuth = function(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    global.logger.info('Unauthorized: No token provided');
    res.status(401).send('Unauthorized: No token provided');
    global.userName="";
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        global.logger.info('Unauthorized: Invalid token');
        res.status(401).send('Unauthorized: Invalid token');
        global.userName="";
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
}
module.exports = withAuth;