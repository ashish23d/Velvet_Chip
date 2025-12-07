
import { supabase } from './supabaseClient.ts';

interface UploadImageOptions {
  file: File;
  bucket: string;
  pathPrefix: string;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Uploads an image file to a specified Supabase Storage bucket.
 * This function constructs a structured file path for the image for easy organization.
 *
 * On success, it returns the `path`. This path is the piece of data that gets
 * stored in our application's database. We do not store the full URL
 * to ensure flexibility. The full URL is constructed on-the-fly when the image is displayed.
 *
 * @param options - The file and its associated metadata for path construction.
 * @returns A promise that resolves to the unique path of the uploaded image in the Supabase bucket.
 * @throws An error if the upload fails.
 */
export interface UploadMediaOptions {
  file: File;
  bucket: string;
  pathPrefix: string;
  maxSizeMB?: number;
}

export const uploadMedia = async (options: UploadMediaOptions): Promise<string> => {
  const { file, bucket, pathPrefix, maxSizeMB = 5 } = options;
  const MAX_FILE_SIZE_BYTES = maxSizeMB * 1024 * 1024;

  // Client-side validation for immediate feedback
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
  }

  // Sanitize prefix for URL to ensure it is valid.
  const sanitizedPrefix = pathPrefix.replace(/[^a-zA-Z0-9\s-/_]/g, '').replace(/[\s-]+/g, '_').toLowerCase();

  // Construct a structured file path.
  const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
  const filePath = `${sanitizedPrefix}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error('Full Supabase upload error:', error);
    if (error.message.includes('row-level security policy')) {
      throw new Error(`Permission denied. Please run the SQL policy script for the '${bucket}' bucket.`);
    }
    throw new Error(error.message || 'An unknown error occurred during upload.');
  }

  return data.path;
};

export const uploadImage = async (options: UploadImageOptions): Promise<string> => {
  return uploadMedia({ ...options, maxSizeMB: 5 });
};


/**
 * Deletes an image file from a specified Supabase Storage bucket.
 *
 * @param options - The bucket and path of the file to delete.
 * @returns A promise that resolves when the deletion is complete.
 * @throws An error if the deletion fails.
 */
export const deleteImage = async ({ bucket, path }: { bucket: string; path: string }): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error('Full Supabase delete error:', error);
    throw new Error(error.message || 'An unknown error occurred during image deletion.');
  }
};
