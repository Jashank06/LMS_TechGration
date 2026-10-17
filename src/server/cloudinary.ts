import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

/**
 * Uploads an image buffer to Cloudinary with face detection cropping and webp optimization.
 */
export async function uploadAvatarToCloudinary(
  buffer: Buffer,
  userId: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "techgration_lms/avatars",
        public_id: `avatar_${userId}`,
        overwrite: true,
        invalidate: true,
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        if (!result) {
          return reject(new Error("No response received from Cloudinary."))
        }
        resolve(result)
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Deletes user's avatar from Cloudinary.
 */
export async function deleteAvatarFromCloudinary(userId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(`techgration_lms/avatars/avatar_${userId}`, {
      invalidate: true,
    })
  } catch (error) {
    console.warn("Could not delete avatar from Cloudinary:", error)
  }
}

/**
 * Uploads a course thumbnail buffer to Cloudinary with 16:9 crop, auto-quality, and webp optimization.
 */
export async function uploadCourseThumbnailToCloudinary(
  buffer: Buffer,
  identifier?: string
): Promise<UploadApiResponse> {
  const publicId = identifier
    ? `course_${identifier.toLowerCase().replace(/[^a-z0-9_-]+/g, "_")}_${Date.now()}`
    : `course_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "techgration_lms/courses",
        public_id: publicId,
        overwrite: true,
        invalidate: true,
        resource_type: "image",
        tags: ["techgration", "course_thumbnail"],
        transformation: [
          { width: 1280, height: 720, crop: "fill", gravity: "auto" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        if (!result) {
          return reject(new Error("No response received from Cloudinary."))
        }
        resolve(result)
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Deletes a course thumbnail from Cloudinary by public ID.
 */
export async function deleteCourseThumbnailFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    })
  } catch (error) {
    console.warn("Could not delete course thumbnail from Cloudinary:", error)
  }
}

/**
 * Uploads a course material/document buffer (PDF, ZIP, IPYNB, etc.) to Cloudinary.
 */
export async function uploadDocumentToCloudinary(
  buffer: Buffer,
  fileName: string,
  courseId: string
): Promise<UploadApiResponse> {
  const cleanName = fileName.toLowerCase().replace(/[^a-z0-9_.-]+/g, "_")
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `techgration_lms/courses/${courseId}/materials`,
        public_id: `${Date.now()}_${cleanName}`,
        resource_type: "auto",
        use_filename: true,
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error("No response received from Cloudinary."))
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}

/**
 * Uploads an official course timetable document or image to Cloudinary.
 */
export async function uploadTimetableToCloudinary(
  buffer: Buffer,
  fileName: string,
  courseId: string
): Promise<UploadApiResponse> {
  const cleanName = fileName.toLowerCase().replace(/[^a-z0-9_.-]+/g, "_")
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `techgration_lms/courses/${courseId}/timetable`,
        public_id: `timetable_${Date.now()}_${cleanName}`,
        resource_type: "auto",
        use_filename: true,
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error("No response received from Cloudinary."))
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })
}


