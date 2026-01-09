import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Validate media file
 */
export const validateMediaFile = (file, type = 'image') => {
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for images, 10MB for videos

    if (file.size > maxSize) {
        throw new Error(`File size exceeds ${type === 'image' ? '5MB' : '10MB'} limit`);
    }

    const allowedTypes = type === 'image'
        ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        : ['video/mp4', 'video/webm', 'video/ogg'];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    return true;
};

/**
 * Upload image to Firebase Storage
 */
export const uploadImage = (file, chatId, onProgress) => {
    return new Promise((resolve, reject) => {
        try {
            validateMediaFile(file, 'image');

            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `chat-media/${chatId}/images/${fileName}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    console.error('Error uploading image:', error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Upload video to Firebase Storage
 */
export const uploadVideo = (file, chatId, onProgress) => {
    return new Promise((resolve, reject) => {
        try {
            validateMediaFile(file, 'video');

            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `chat-media/${chatId}/videos/${fileName}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    console.error('Error uploading video:', error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Upload profile photo to Firebase Storage
 */
export const uploadProfilePhoto = (file, userId, onProgress) => {
    return new Promise((resolve, reject) => {
        try {
            validateMediaFile(file, 'image');

            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const storageRef = ref(storage, `profile-photos/${userId}/${fileName}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (onProgress) {
                        onProgress(progress);
                    }
                },
                (error) => {
                    console.error('Error uploading profile photo:', error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        } catch (error) {
            reject(error);
        }
    });
};
