import { v2 as cloudinary } from 'cloudinary';
cloudinary.config(process.env.CLOUDINARY_URL as string);

export const uploadImage = (buffer: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({}, (error, result) => {

            if (error) {
                return reject(error)
            }
                resolve(result)
        })
        .end(buffer);
    })
}