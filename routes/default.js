const express  = require('express');
const utils    = require('../utils');
const router   = express.Router();
const database = require('./db');
const i18n = require('i18n');

router.get('/',(req,res,next) => {
    const locale = i18n.getCatalog(req, i18n.getLocale(req));
    if(req.query.mode && req.query.mode == 'password'){
        return res.render('password', { locale: locale });
    }
    return res.render('webauthn', { locale: locale });
})

/* Returns if user is logged in */
router.get('/isLoggedIn', (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed'
        })
    } else {
        response.json({
            'status': 'ok'
        })
    }
})

/* Logs user out */
router.get('/logout', (request, response) => {
    request.session.loggedIn = false;
    request.session.username = undefined;

    response.json({
        'status': 'ok'
    })
})

/* Returns personal info and THE SECRET INFORMATION */
router.get('/personalInfo', (request, response) => {
    if(!request.session.loggedIn) {
        response.json({
            'status': 'failed',
            'message': 'Access denied'
        })
    } else {
        response.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.json({
            'status': 'ok',
            'name': database[request.session.username].name,
            'theSecret': '<img src="https://source.unsplash.com/random/250x250">'
        })
    }
})
module.exports = router;
