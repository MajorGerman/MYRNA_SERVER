const isRolesInUser = (user, roles) => {
    for (role of roles){
        if (user.roles.indexOf(role) === -1){return false}
    }
    return true
}

module.exports = {isRolesInUser};