const express   = require('express');
const utils     = require('../utils');
const config    = require('../config.json');
const base64url = require('base64url');
const router    = express.Router();
const database  = require('./db');
const dbutils = require('./dbutils');


router.post('/options', (request, response) => {
    console.log(request.body)

    if(!request.body || !request.body.username || !request.body.displayName) {
        response.json({
            'status': 'failed',
            'message': 'Request missing name or username field!'
        })

        return
    }

    let username = request.body.username;
    let name     = request.body.displayName;
    let attestation = request.body.attestation;
    let authenticatorSelection = request.body.authenticatorSelection;

    if(database[username] && database[username].registered) {
        response.json({
            'status': 'failed',
            'message': `Username ${username} already exists`
        })

        return
    }

    if(!database[username]){
        database[username] = {
            'name': name,
            'registered': false,
            'id': utils.randomBase64URLBuffer(),
            'authenticators': []
        };
    } else {
        database[username].registered = false;
        database[username].authenticators = [];
    }


    let challengeMakeCred    = utils.generateServerMakeCredRequest(username, name, database[username].id, attestation, authenticatorSelection)
    challengeMakeCred.status = 'ok'
    challengeMakeCred.errorMessage = ""

    request.session.challenge = challengeMakeCred.challenge;
    request.session.username  = username;

    console.log(challengeMakeCred)
    response.json(challengeMakeCred)
})


router.post('/result', (request, response) => {
    console.log(request.body)
    if(!request.body       || !request.body.id
    || !request.body.rawId || !request.body.response
    || !request.body.type  || request.body.type !== 'public-key' ) {
        response.json({
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        })

        return
    }

    if(typeof request.body.id !== 'string' || typeof request.body.rawId !== 'string'){
        response.json({
            'status': 'failed',
            'message': 'id and rawId should be Dom string'
        })

        return
    }

    try {
        let result = base64url.decode(request.body.id)
        console.log(result)
    } catch (error) {
        response.json({
            'status': 'failed',
            'message': 'id must encode as base64url'
        })
        return
    }

    let webauthnResp = request.body
    let clientData   = JSON.parse(base64url.decode(webauthnResp.response.clientDataJSON));

    /* Check challenge... */
    if(clientData.challenge !== request.session.challenge) {
        response.json({
            'status': 'failed',
            'message': 'Challenges don\'t match!'
        })
    }

    /* ...and origin */
    if(clientData.origin !== config.origin) {
        response.json({
            'status': 'failed',
            'message': 'Origins don\'t match!'
        })
    }

    let result;
    if(webauthnResp.response.attestationObject !== undefined) {
        /* This is create cred */
        console.log('start verify signature')
        result = utils.verifyAuthenticatorAttestationResponse(webauthnResp);

        if(result.verified) {
            database[request.session.username].authenticators.push(result.authrInfo);
            database[request.session.username].registered = true
        }
    }

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
