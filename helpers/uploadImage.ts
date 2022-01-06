import { v2 as cloudinary } from 'cloudinary';
cloudinary.config(process.env.CLOUDINARY_URL as string);

export const uploadImage = (buffer: Buffer, folder: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({format: 'jpg', folder: 'cards/' + folder}, (error, result) => {

            if (error) {
                return reject(error)
            }
                resolve(result)
        })
        .end(buffer);
    })
}