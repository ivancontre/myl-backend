declare module Express {
    export interface Request {
        user: any;
        file?: any;
    }
}