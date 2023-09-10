const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

module.exports = (req, res, next) => {
    stripe.checkout.sessions.retrieve(req.query.session_id)
        .then(sessionId => {
            // console.log('+++SESSION IS+++', sessionId);
            next()
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}
