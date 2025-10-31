/**
 * Cloudinary service for video management
 * Handles video URL generation with signed URLs for security
 */

import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/environment';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Cloudinary service interface
 */
export interface CloudinaryService {
  generateSignedVideoUrl(videoId: string, options?: VideoOptions): string;
  uploadVideo(videoPath: string, options?: UploadOptions): Promise<UploadResult>;
  deleteVideo(videoId: string): Promise<DeleteResult>;
}

/**
 * Video options for URL generation
 */
export interface VideoOptions {
  duration?: number; 
  transformation?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  };
}

/**
 * Upload options for video upload
 */
export interface UploadOptions {
  folder?: string;
  resource_type?: 'video' | 'image' | 'raw';
  public_id?: string;
}

/**
 * Upload result interface
 */
export interface UploadResult {
  public_id: string;
  secure_url: string;
  duration?: number;
  width?: number;
  height?: number;
}

/**
 * Delete result interface
 */
export interface DeleteResult {
  result: string;
  public_id: string;
}

/**
 * Cloudinary service implementation
 */
class CloudinaryServiceImpl implements CloudinaryService {
  /**
   * Generate a signed URL for video access
   * @param videoId - The public ID of the video in Cloudinary
   * @param options - Video options for URL generation
   * @returns Signed URL for video access
   */
  generateSignedVideoUrl(videoId: string, options: VideoOptions = {}): string {
    const {
      duration = 3600, 
      transformation = {}
    } = options;

    try {
      const signedUrl = cloudinary.url(videoId, {
        resource_type: 'video',
        expires_at: Math.floor(Date.now() / 1000) + duration,
        sign_url: true,
        transformation: {
          quality: 'auto',
          format: 'mp4',
          ...transformation
        }
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed video URL');
    }
  }

  /**
   * Upload a video to Cloudinary
   * @param videoPath - Path to the video file
   * @param options - Upload options
   * @returns Upload result with video details
   */
  async uploadVideo(videoPath: string, options: UploadOptions = {}): Promise<UploadResult> {
    const {
      folder = 'movies',
      resource_type = 'video',
      public_id
    } = options;

    try {
      const result = await cloudinary.uploader.upload(videoPath, {
        resource_type,
        folder,
        public_id,
        use_filename: true,
        unique_filename: true
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        duration: result.duration,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Failed to upload video to Cloudinary');
    }
  }

  /**
   * Delete a video from Cloudinary
   * @param videoId - The public ID of the video to delete
   * @returns Delete result
   */
  async deleteVideo(videoId: string): Promise<DeleteResult> {
    try {
      const result = await cloudinary.uploader.destroy(videoId, {
        resource_type: 'video'
      });

      return {
        result: result.result,
        public_id: result.public_id
      };
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error('Failed to delete video from Cloudinary');
    }
  }

  /**
   * Get video information from Cloudinary
   * @param videoId - The public ID of the video
   * @returns Video information
   */
  async getVideoInfo(videoId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(videoId, {
        resource_type: 'video'
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        duration: result.duration,
        width: result.width,
        height: result.height,
        format: result.format,
        created_at: result.created_at
      };
    } catch (error) {
      console.error('Error getting video info:', error);
      throw new Error('Failed to get video information');
    }
  }
}

export const cloudinaryService = new CloudinaryServiceImpl();
