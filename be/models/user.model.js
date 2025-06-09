const { sql, pool, poolConnect } = require('../config/db');

// =======================
// TÌM USER THEO USERNAME
// =======================
const findUserByUsername = async (username, callback) => {
  try {
    await poolConnect;
    const request = pool.request();
    const result = await request
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM [User] WHERE username = @username');

    callback(null, result.recordset[0]);
  } catch (err) {
    callback(err);
  }
};

// =======================
// TẠO NGƯỜI DÙNG MỚI
// =======================
const createUser = async (user, callback) => {
  try {
    await poolConnect;
    const request = pool.request();

    const result = await request
      .input('username', sql.NVarChar, user.username)
      .input('password', sql.NVarChar, user.password)
      .input('full_name', sql.NVarChar, user.full_name || null)
      .input('dob', sql.Date, user.dob || null)
      .input('gender', sql.NVarChar, user.gender || null)
      .input('email', sql.NVarChar, user.email || null)
      .input('identity_card', sql.NVarChar, user.identity_card || null)
      .input('phone_number', sql.NVarChar, user.phone_number || null)
      .input('address', sql.NVarChar, user.address || null)
      .input('role', sql.NVarChar, user.role)
      .input('is_active', sql.Bit, user.is_active !== undefined ? user.is_active : 1)
      .query(`
        INSERT INTO [User] (
          username, password, full_name, dob, gender,
          email, identity_card, phone_number, address,
          role, is_active
        )
        VALUES (
          @username, @password, @full_name, @dob, @gender,
          @email, @identity_card, @phone_number, @address,
          @role, @is_active
        )
      `);

    callback(null, result);
  } catch (err) {
    callback(err);
  }
};

module.exports = {
  findUserByUsername,
  createUser,
};
