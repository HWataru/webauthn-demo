const express   = require('express');
const utils     = require('../utils');
const router    = express.Router();
const database  = require('./db');
const dbutils = require('./dbutils');

router.post('/options', (request, response) => {

    let userVerificationRequired = request.body.userVerification;
    if(!userVerificationRequired){
        userVerificationRequired = 'discouraged'
    }

    if (request.body.loginWithResidentKey) {
        let getAssertion = utils.generateServerGetAssertion()
        getAssertion.status = 'ok';
        request.session.challenge = getAssertion.challenge;
        response.json(getAssertion)
        return;
    }

    if (!request.body || !request.body.username) {

        response.json({
            'status': 'failed',
            'message': 'Request missing username field!'
        })
        return
    }

    let username = request.body.username;
    if (!database[username]) {
        response.json({
            'status': 'failed',
            'message': `User ${username} does not exist!`
        })

    }

    if (!database[username].registered) {
        response.json({
            'status': 'failed',
            'message': `User ${username} does not registered!`
        })

        return
    }


    let getAssertion = utils.generateServerGetAssertion(database[username].authenticators, userVerificationRequired)
    getAssertion.status = 'ok'
    getAssertion.errorMessage = ""
    request.session.challenge = getAssertion.challenge;
    request.session.username = username;

    response.json(getAssertion)
})

router.post('/result', (request, response) => {
    let webauthnResp = request.body;
    if(webauthnResp.response.authenticatorData == undefined) {
        response.json({
            'status': 'failed',
            'message': 'Can not determine type of response!'
        })
    }
    /* This is get assertion */
    var username = request.session.username;
    if (!request.session.username) {
        var credentialId = webauthnResp.rawId;
        username = dbutils.getUsernameFromCredentialID(credentialId);
        request.session.username = username;
    }
    result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database[request.session.username].authenticators);

    if(result.verified) {
        request.session.loggedIn = true;
        response.json({ 'status': 'ok' })
    } else {
        response.json({
            'status': 'failed',
            'message': 'Can not authenticate signature!'
        })
    }
})

module.exports = router;