declare module Express {
    export interface Request {
        user: any;
        file?: Multer.File | undefined
    }
}