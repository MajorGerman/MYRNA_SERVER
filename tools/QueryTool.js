const getOne = async (pool, query) => {
    let conn = await pool.getConnection();
    let [data, fields] = await conn.query(query);
    conn.release()
    return data[0]
}
const getMany = async (pool, query) => {
    let conn = await pool.getConnection();
    let [data, fields] = await conn.query(query);
    conn.release()
    return data
}
const insert = async (pool, query) => {
    let conn = await pool.getConnection();
    let [data, fields] = await conn.query(query);
    conn.release()
    return [data, fields]
}
module.exports = {getOne, getMany, insert}