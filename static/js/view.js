/**
 * Switch to login page
 */
$('#toLogin').click(function(e) {
    e.preventDefault();
    $('.column').hide();
    $('#loginContainer').show();
})

/**
 * Switch to registration page
 */
$('#toRegistration').click(function(e) {
    e.preventDefault();
    $('.column').hide();
    $('#registerContainer').show();
})

let loadMainContainer = () => {
    return fetch('/personalInfo', {credentials: 'include'})
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                $('#theSecret').html(response.theSecret)
                $('#name').html(response.name)
                $('.column').hide();
                $('#mainContainer').show();
            } else {
                alert(`Error! ${response.message}`)
            }
        })
}

let checkIfLoggedIn = () => {
    return fetch('/isLoggedIn', {credentials: 'include'})
        .then((response) => response.json())
        .then((response) => {
            if(response.status === 'ok') {
                return true
            } else {
                return false
            }
        })
}

$('#logoutButton').click(() => {
    fetch('/logout', {credentials: 'include'});

    $('.column').hide();
    $('#loginContainer').show();
})