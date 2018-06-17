const database = require('./db');

let getUsernameFromCredentialID = function(credentialId){
    let matchedUsername;
    Object.keys(database).forEach((username) => {
        var authenticators = database[username].authenticators
        authenticators.forEach((authenticator) => {
            if(authenticator.credID === credentialId){
                matchedUsername = username;
            }            
        })
    })
    return matchedUsername;
}

module.exports = {
    getUsernameFromCredentialID
}