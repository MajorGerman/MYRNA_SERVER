const isRolesInUser = (user_roles, roles) => {
    for (role of roles){
        if (user_roles.indexOf(role) === -1){return false}
    }
    return true
}

module.exports = {isRolesInUser};