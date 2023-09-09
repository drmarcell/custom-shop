exports.get404 = (req, res, next) => {
    res.status(404).render('page404', {
        pageTitle: 'Page Not Found',
        path: '/404',
        isLoggedIn: req.ression.isLoggedIn
    });
};

exports.get500 = (req, res, next) => {
    console.log('get500 session: ', req.session);
    res.status(500).render('page500', {
        pageTitle: 'Error!',
        path: '/500',
        isLoggedIn: req.session.isLoggedIn
    });
};