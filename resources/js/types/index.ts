import type { Auth } from './auth';

export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './admin';

export type SharedData = {
    auth: Auth;
    [key: string]: unknown;
};
