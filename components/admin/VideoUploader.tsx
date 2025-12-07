import React, { useState, useRef } from 'react';
import { uploadMedia } from '../../services/supabaseImageService.ts';
import PlusIcon from '../icons/PlusIcon.tsx';
import TrashIcon from '../icons/TrashIcon.tsx';
import { BUCKETS } from '../../constants.ts';

interface VideoUploaderProps {
    bucket: string;
    pathPrefix: string;
    videoPath: string;
    onVideoUpload: (path: string) => void;
    onVideoRemove: () => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ bucket, pathPrefix, videoPath, onVideoUpload, onVideoRemove }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const path = await uploadMedia({
                file,
                bucket,
                pathPrefix,
                maxSizeMB: 50 // Allow up to 50MB for videos
            });
            onVideoUpload(path);
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getPublicUrl = (path: string) => {
        return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    };

    return (
        <div>
            <div className="w-full max-w-md">
                {videoPath ? (
                    <div className="relative group rounded-lg overflow-hidden bg-black aspect-video">
                        <video
                            src={getPublicUrl(videoPath)}
                            className="w-full h-full object-contain"
                            controls
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                type="button"
                                onClick={onVideoRemove}
                                className="p-2 bg-white/80 text-red-500 rounded-full hover:bg-white shadow-sm"
                                aria-label="Remove video"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                    >
                        {isUploading ? (
                            <>
                                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm mt-2 font-medium">Uploading Video...</span>
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-10 h-10 mb-2" />
                                <span className="text-sm font-medium">Upload Video</span>
                                <span className="text-xs text-gray-500 mt-1">MP4, WebM (Max 50MB)</span>
                            </>
                        )}
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/mp4,video/webm,video/ogg"
                    className="hidden"
                    disabled={isUploading}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default VideoUploader;
