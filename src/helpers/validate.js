

const username = (input) => {
    if (typeof input !== 'string' || !input.length){
        return false;
    }
    const regex = /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,18}(?:[A-Za-z0-9_]))?)$/;
    return !!input.match(regex);
}


const usernameAutocomplete = (input) => {
    if (typeof input !== 'string' || !input.length){
        return false;
    }
    const regex = /^([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,18}(?:[A-Za-z0-9_]))?)$/;
    return !!input.match(regex);
}


module.exports = {username,usernameAutocomplete};