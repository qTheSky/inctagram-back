import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

export const validateImage = async (
  image: Express.Multer.File,
  validateRules: { width?: number; height?: number; maxFileSizeKB?: number } = {
    width: 9999,
    height: 9999,
    maxFileSizeKB: 1000,
  }
): Promise<{
  validatedImage: Buffer;
  // imageExtension: string;
  // imageMetaData: sharp.Metadata;
}> => {
  if (!image) {
    throw new BadRequestException([{ field: 'file', message: 'no file' }]);
  }

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  /**
   * if file extension isn`t jpeg or jpg or png
   */
  if (!allowedMimeTypes.includes(image.mimetype)) {
    throw new BadRequestException([
      { field: 'file', message: 'file must be png, jpg or jpeg' },
    ]);
  }

  const imageMetaData = await sharp(image.buffer).metadata();

  if (imageMetaData.size > validateRules.maxFileSizeKB * 1000) {
    throw new BadRequestException([
      {
        field: 'file',
        message: `image max size is ${validateRules.maxFileSizeKB}kb`,
      },
    ]);
  } else if (
    imageMetaData.width > validateRules.width ||
    imageMetaData.height > validateRules.height
  ) {
    throw new BadRequestException([
      {
        field: 'file',
        message: `image should be ${validateRules.width}x${validateRules.height} resolution`,
      },
    ]);
  }

  return { validatedImage: await sharp(image.buffer).png().toBuffer() };
};
