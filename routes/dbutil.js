const express  = require('express');
const utils    = require('../utils');
const database = require('./db');
const router   = express.Router();

router.get('/clear', (_, response) => {
    const oldDB = Object.assign({}, database);
    for (var member in database) delete database[member];
    response.json({
        'status': 'ok',
        'action' : 'clear',
        'database' : oldDB
    })
})

router.get('/show', (_, response) => {
    response.json({
        'status': 'ok',
        'action' : 'show',        
        'database' : database
    })
})

module.exports = router;