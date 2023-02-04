const jwt = require('jsonwebtoken');

verifyToken = (req, res, next) => {
    //let token = req.headers.token;
    const token = req.header('authorization');
    if (!token) {
        return res.status(403).send({
            message: 'No token provided!'
        });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized!'
            });
        }
        req.admin = decoded;
        next();
    }
    );
};

const authJwt = {
    verifyToken: verifyToken
};
module.exports = authJwt;