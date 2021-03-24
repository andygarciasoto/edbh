import openSocket from 'socket.io-client';
import { SOCKET } from '../Utils/Constants';

export const socket = openSocket.connect(SOCKET);