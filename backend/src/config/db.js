import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ams',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully.');
        connection.release();
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

export default pool;