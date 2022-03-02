const crypto = require('crypto');
const generateHashedPasswordAndSalt = async (passwordString) => {
    let salt = crypto.randomBytes(16).toString('hex')
    key =  crypto.scryptSync(passwordString, salt, 16);
    let hashedPassword = key.toString('hex')
    return hashedPassword, salt
};
const validatePassword = async (passwordString, salt, trueHashedPassword) =>{
    key =  crypto.scryptSync(passwordString, salt.toString('hex'), 16);
    let hashedPassword = key.toString('hex')
    console.log(trueHashedPassword.toString('hex') , hashedPassword)
    if (trueHashedPassword.toString('hex') == hashedPassword) return true
    return false 
}

module.exports = {generateHashedPasswordAndSalt, validatePassword}