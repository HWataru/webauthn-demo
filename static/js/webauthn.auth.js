'use strict';

let getMakeCredentialsChallenge = (formBody) => {
    return fetch('/attestation/options', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

            return response
    })
}

let sendAssertionResponse = (body) => {
    return fetch('/assertion/result', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

let sendAttestationResponse = (body) => {
    return fetch('/attestation/result', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

/* Handle for register form submission */
$('#register').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;
    let displayName     = this.displayName.value;
    let residentKey = this.requireResidentKey.checked;
    let userVerification = this.userVerification.value;

    if(!username || !displayName) {
        alert('displayName or username is missing!')
        return
    }

    getMakeCredentialsChallenge({username, displayName})
        .then((response) => {
            let publicKey = preformatMakeCredReq(response);
            publicKey.authenticatorSelection = {}
            publicKey.authenticatorSelection["userVerification"] = userVerification; 
            if(residentKey)publicKey.authenticatorSelection['requireResidentKey'] = true;
            return navigator.credentials.create({ publicKey })
        })
        .then((response) => {
            let makeCredResponse = publicKeyCredentialToJSON(response);
            return sendAttestationResponse(makeCredResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Server responed with error. The message is: ${response.message}`);
            }
        })
        .catch((error) => alert(error))
})

let getGetAssertionChallenge = (formBody) => {
    return fetch('/assertion/options', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

/* Handle for login form submission */
$('#login').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;

    if(!username) {
        alert('Username is missing!')
        return
    }

    getGetAssertionChallenge({username})
        .then((response) => {
            console.log(response)
            let publicKey = preformatGetAssertReq(response);
            return navigator.credentials.get({ publicKey })
        })
        .then((response) => {
            console.log()
            let getAssertionResponse = publicKeyCredentialToJSON(response);
            return sendAssertionResponse(getAssertionResponse, 'assertion')
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Server responed with error. The message is: ${response.message}`);
            }
        })
        .catch((error) => alert(error))
})

//Login with residentKey
$('#loginWithResidentKey').submit(function(event) {
    event.preventDefault();
    const loginWithResidentKey = true;
    getGetAssertionChallenge({loginWithResidentKey})
        .then((response) => {
            console.log(response)
            let publicKey = preformatGetAssertReq(response);
            return navigator.credentials.get({ publicKey })
        })
        .then((response) => {
            console.log()
            let getAssertionResponse = publicKeyCredentialToJSON(response);
            return sendAssertionResponse(getAssertionResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Server responed with error. The message is: ${response.message}`);
            }
        })
        .catch((error) => alert(error))
})