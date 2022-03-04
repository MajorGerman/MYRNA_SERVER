const createError = (err = false, code = 0, description = '') => {
    return {
        'err': err,
        'code': code,
        'description': description 
    }
}
const createResponse = (error = createError(), data) => {
    return {
        'error': error,
        'data' : data
    }
}

module.exports = {createError, createResponse}