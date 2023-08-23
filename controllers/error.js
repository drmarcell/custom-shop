exports.get404 = (req, res, next) => {
    res.status(404).render('page404', {
        pageTitle: 'Page Not Found',
        path: null
    });
};
