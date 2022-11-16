import { Server } from 'https';
import { SocketIoServer } from '../../../loaders/socket';
import { store } from '..';
import system from './system';

export const setInternalIp = (payload: string) => store.dispatch(system.actions.setInternalIp(payload));

export const setExternalIp = (payload: string) => store.dispatch(system.actions.setExternalIp(payload));

export const setOwner = (payload: string) => store.dispatch(system.actions.setOwner(payload));

export const setSecureInternalPort = (payload: number) => store.dispatch(system.actions.setSecureInternalPort(payload));

export const setSecureExternalPort = (payload: number) => store.dispatch(system.actions.setSecureExternalPort(payload));

export const setHasMakeMkv = (payload: boolean) => store.dispatch(system.actions.setHasMakeMkv(payload));

export const setHasSubtitleEdit = (payload: boolean) => store.dispatch(system.actions.setHasSubtitleEdit(payload));

export const setHttpsServer = (payload: Server) => store.dispatch(system.actions.setHttpsServer(payload));

export const setSocketServer = (payload: SocketIoServer) => store.dispatch(system.actions.setSocketServer(payload));

export const setClientList = (payload: any[]) => store.dispatch(system.actions.setClientList(payload));
