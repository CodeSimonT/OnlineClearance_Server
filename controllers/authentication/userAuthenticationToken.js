const jwt = require('jsonwebtoken');
require('dotenv').config();

const userAuthenticationToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({ error: 'Authorization token not found.' });
    }

    // Check if the header starts with "Bearer " and adjust accordingly
    const tokenParts = authorizationHeader.split(' ');
    const token = tokenParts.length === 2 ? tokenParts[1] : authorizationHeader;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }

        req.user = user;
        next();
    });
}

module.exports = userAuthenticationToken;