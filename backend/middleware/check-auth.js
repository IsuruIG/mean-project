const jwt = require("jsonwebtoken");

const serectJWT = "secret_this_should_be_longer";

module.exports = ((req, res, next) => {
  try {
    const token =  req.headers.authorization.split("Bearer ")[1]; // headers auth = "Bearer jsnflsjfskjflsdjfl" - to extract this token.
    const decodedToken = jwt.verify(token, serectJWT);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({message: "Auth failed!"});
  }
});
