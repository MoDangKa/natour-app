import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fs from 'fs';
import mime from 'mime-types';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import sharp from 'sharp';

import CustomError from '../utils/customError';

enum Category {
  Unspecified = 'unspecified',
  User = 'user',
  Tour = 'tour',
}

enum FilesDirectory {
  NoFile = '',
  UserPhoto = 'img/users',
  TourImages = 'img/tours',
}

enum FileType {
  Image = 'image',
  Document = 'document',
}

enum ImageType {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  GIF = 'gif',
  WEBP = 'webp',
}

const ALLOWED_IMAGE_TYPES = Object.values(ImageType).map((el) => `image/${el}`);

const ALLOWED_DOCUMENT_TYPES = [
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/pdf', // .pdf
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
];

const DEFAULT_FILE_SIZE_LIMIT_MB = 5;

function getAllowedTypes(fileType: FileType): string[] {
  switch (fileType) {
    case FileType.Image:
      return ALLOWED_IMAGE_TYPES;
    case FileType.Document:
      return ALLOWED_DOCUMENT_TYPES;
    default:
      return [];
  }
}

type FilenameFunction = (
  file: Express.Multer.File,
  category: Category,
  id?: string,
) => string;

const defaultFilenameFunction: FilenameFunction = (
  file,
  id = 'unknown',
  category,
) => {
  const ext = mime.extension(file.mimetype) || 'unknown';
  return `${category}-${id}-${Date.now()}.${ext}`;
};

const ensureDirectoryExistence = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const documentStorage = (
  category: Category,
  directory: FilesDirectory,
  filenameFunc: FilenameFunction = defaultFilenameFunction,
) =>
  multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      const fullPath = path.resolve(__dirname, '..', 'public', directory);
      try {
        ensureDirectoryExistence(fullPath);
        cb(null, fullPath);
      } catch (error) {
        cb(new CustomError('Failed to create/access directory', 500), '');
      }
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      try {
        const filename = filenameFunc(file, category, req.user.id);
        cb(null, filename);
      } catch (error) {
        cb(new CustomError('Failed to generate filename', 500), '');
      }
    },
  });

const imageStorage = multer.memoryStorage();

const multerFilter =
  (fileType?: FileType) =>
  (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!fileType) {
      return cb(null, true);
    }

    const allowedTypes = getAllowedTypes(fileType);

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new CustomError(
        `Invalid file type. Allowed types are: ${allowedTypes.join(', ')}`,
        400,
      );
      cb(error);
    }
  };

type Upload = {
  category?: Category;
  directory?: FilesDirectory;
  fileType?: FileType;
  size?: number;
  filenameFunc?: FilenameFunction;
};

const upload = (options: Upload = {}) => {
  const {
    category = Category.Unspecified,
    directory = FilesDirectory.NoFile,
    fileType = FileType.Image,
    size = DEFAULT_FILE_SIZE_LIMIT_MB,
  } = options;
  const storage =
    fileType === FileType.Image
      ? imageStorage
      : documentStorage(category, directory);

  return multer({
    storage,
    fileFilter: multerFilter(
      fileType,
    ) as unknown as multer.Options['fileFilter'],
    limits: { fileSize: size * 1024 * 1024 },
  });
};

const resizeUserPhoto = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file || !ALLOWED_IMAGE_TYPES.includes(req.file.mimetype))
    return next();

  const ext = mime.extension(req.file.mimetype) || ImageType.JPG;
  req.file.filename = `${Category.User}-${req?.user?.id || 'unknown'}-${Date.now()}.${ext}`;

  const fullPath = path.resolve(
    __dirname,
    '..',
    'public',
    FilesDirectory.UserPhoto,
  );
  ensureDirectoryExistence(fullPath);

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat(ext as keyof sharp.FormatEnum)
    .jpeg({ quality: 90 })
    .toFile(path.join(fullPath, req.file.filename), (err) => {
      if (err) {
        return next(new CustomError('Error processing image', 500));
      }
      next();
    });
};

const resizeTourImages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.files?.imageCover || !req.files?.images) {
      return next();
    }

    const fullPath = path.resolve(
      __dirname,
      '..',
      'public',
      FilesDirectory.TourImages,
    );
    ensureDirectoryExistence(fullPath);

    const allFiles = [
      ...(req.files.imageCover || []),
      ...(req.files.images || []),
    ];

    let imageCover: string = '';
    const images: string[] = [];

    const fileProcessingPromises = allFiles.map((file, i) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        throw new CustomError('Invalid image type', 400);
      }

      const ext = mime.extension(file.mimetype) || ImageType.JPG;
      const fileName =
        file.fieldname === 'imageCover'
          ? `${Category.Tour}-${req.params.id}-${Date.now()}-cover.${ext}`
          : `${Category.Tour}-${req.params.id}-${Date.now()}-${i}.${ext}`;

      if (file.fieldname === 'imageCover') {
        imageCover = fileName;
      } else {
        images.push(fileName);
      }

      return sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat(ext as keyof sharp.FormatEnum)
        .jpeg({ quality: 90 })
        .toFile(path.join(fullPath, fileName));
    });

    try {
      await Promise.all(fileProcessingPromises);
    } catch (err) {
      return next(new CustomError('Error processing images', 500));
    }

    req.body.imageCover = imageCover;
    req.body.images = images;

    next();
  },
);

const uploadNoFile = upload().none();
const uploadSingleUserPhoto = [
  upload({
    category: Category.User,
    directory: FilesDirectory.UserPhoto,
  }).single('photo'),
  resizeUserPhoto,
];

const uploadTourImages = [
  upload({
    category: Category.Tour,
    directory: FilesDirectory.TourImages,
  }).fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]),
  resizeTourImages,
];

export {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  Category,
  FilesDirectory,
  FileType,
  resizeUserPhoto,
  Upload,
  uploadNoFile,
  uploadSingleUserPhoto,
  uploadTourImages,
};
