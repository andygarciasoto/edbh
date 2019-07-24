const sql = require('mssql')

const config = {
    user: '962153',
    domain: 'parker.com',
    password: '318iBT9crNqD',
    server: 'phc-diviot01-dev-sql.database.windows.net',
    database: 'FCGFOTF',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        trusted_connection: true
    }
}

const init = async () => {
    try {
        let pool = await sql.connect(config)
        let result1 = await pool.request()
            .input('input_parameter', sql.Int, value)
            .query('select * from Asset')
            
        console.dir(result1)
    
        // Stored procedure
        
        let result2 = await pool.request()
            .input('input_parameter', sql.Int, value)
            .output('output_parameter', sql.VarChar(50))
            .execute('procedure_name')
        
        console.dir(result2)
    } catch (err) {
        // ... error checks
    }
}

export default init;

