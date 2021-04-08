import { Request } from 'tedious';
import ConnectionPool from 'tedious-connection-pool';
import moment from 'moment';
import _ from 'lodash';

const poolConfig = {
    min: 60,
    max: 120,
    log: true,
};

export class SqlServerStore {

    private readonly pool: Promise<ConnectionPool>;

    constructor(config: any) {
        const connConfig = {
            userName: config.sql_section.user,
            password: config.sql_section.password,
            server: config.sql_section.server,
            database: config.sql_section.database,
            options: {
                database: config.sql_section.database,
                encrypt: true,
                useColumnNames: true,
                requestTimeout: 10000
            },
        };
        this.pool = new Promise<ConnectionPool>((resolve, reject) => {
            const pool = new ConnectionPool(poolConfig, connConfig);
            pool.on('error', err => {
                console.log(err);
                reject(err);
            });
            pool.acquire((err, conn) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                conn.release();
                resolve(pool);
            });
        });
    }

    public isConnected(): boolean {
        // TODO implement check
        return true;
    }

    public async ExecuteProcedure(procedure: string, parameters: any): Promise<any> {
        const pool = await this.pool;
        return new Promise<any>((resolve, reject) => {
            pool.acquire((poolErr, conn) => {
                const results = [];
                if (poolErr) {
                    return reject(poolErr);
                }
                const request = new Request(procedure, (reqErr) => {
                    conn.release();
                    if (reqErr) {
                        return reject(reqErr);
                    }
                    resolve(results);
                });
                parameters.forEach(param => request.addParameter(
                    param.ParameterName,
                    param.ParameterType,
                    param.ParameterValue,
                ));
                request.on('row', cols => {
                    const row = {};
                    _.forEach(cols, col => {
                        row[col.metadata.colName] = col.value;
                    });
                    results.push(row);
                });
                conn.callProcedure(request);
            });
        });
    }

    public async ExecuteQuery(query: string): Promise<any> {
        const pool = await this.pool;
        return new Promise<any>((resolve, reject) => {
            pool.acquire((poolErr, conn) => {
                const results = [];
                if (poolErr) {
                    return reject(poolErr);
                }
                const request = new Request(query, (reqErr) => {
                    conn.release();
                    if (reqErr) {
                        return reject(reqErr);
                    }
                    resolve(results);
                });
                request.on('row', (cols) => {
                    const row = {};
                    _.forEach(cols, col => {
                        if (col.value instanceof Date) {
                            row[col.metadata.colName] = moment(col.value).format('YYYY-MM-DD HH:mm:ss');
                        } else {
                            row[col.metadata.colName] = col.value;
                        }
                    });
                    results.push(row);
                });
                conn.execSql(request);
            });
        });
    }

}