

//crypto lib for hmac function
var crypto = require('crypto');

var roll = function (secret, nonce) {

    //create HMAC using server seed as serverSeed and client seed as message
    var hash = crypto.createHmac('sha512', secret).update(nonce.toString()).digest('hex');

    var index = 0;

    var lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);

    //keep grabbing characters from the hash while greater than
    while (lucky >= Math.pow(10, 6)) {
        index++;
        lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);

        //if we reach the end of the hash, just default to highest number
        if (index * 5 + 5 > 128) {
            lucky = 99.99;
            break;
        }
    }

    lucky %= Math.pow(10, 4);
    lucky /= Math.pow(10, 2);

    return lucky;
}
module.exports = roll;