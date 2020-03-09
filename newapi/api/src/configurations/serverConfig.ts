import io from 'socket.io';
import { SqlServerStore } from './sqlserverstore';

export class ServerConfig {

    private ioServer: io.Server;
    public readonly sqlServerStore: SqlServerStore;

    constructor(sqlServerStore: SqlServerStore) {
        this.ioServer = io();
        // tslint:disable-next-line: no-empty
        this.ioServer.on('connection', () => { });
        this.sqlServerStore = sqlServerStore;
    }

    public async startServer() {
        let server = this.ioServer;
        await this.sqlServerStore.ExecuteQuery('SELECT [socket_timeout] FROM [dbo].[GlobalParameters]').then(result => {
            setInterval(() => {
                try {
                    server.emit('message', { id: `All connected clients`, message: true });
                } catch (ex) {
                    console.log(ex);
                }
            }, result[0].socket_timeout);
        });
    }

    public getServer(): io.Server {
        return this.ioServer;
    }
}