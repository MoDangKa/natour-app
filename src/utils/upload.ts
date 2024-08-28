import { Request } from 'express';
import mime from 'mime-types';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';

import CustomError from './customError';

enum Category {
  Unspecified = 'unspecified',
  User = 'user',
  Tour = 'tour',
}

enum FilesDirectory {
  NoFile = '',
  UserPhoto = 'img/users',
}

enum FileType {
  Image = 'image',
  Document = 'document',
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/gif',
];

export const ALLOWED_DOCUMENT_TYPES = [
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
  req: Request,
  file: Express.Multer.File,
  category: Category,
) => string;

const defaultFilenameFunction: FilenameFunction = (req, file, category) => {
  const ext = mime.extension(file.mimetype) || 'unknown';
  return `${category}-${req?.user?.id || 'unknown'}-${Date.now()}.${ext}`;
};

const multerStorage = (
  category: Category,
  directory: FilesDirectory,
  filenameFunc: FilenameFunction = defaultFilenameFunction,
) =>
  multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, path.resolve(__dirname, '../public', directory));
    },
    filename: (req: Request, file: Express.Multer.File, cb) => {
      const filename = filenameFunc(req, file, category);
      cb(null, filename);
    },
  });

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
    fileType,
    size = DEFAULT_FILE_SIZE_LIMIT_MB,
  } = options;
  return multer({
    storage: multerStorage(category, directory),
    fileFilter: multerFilter(
      fileType,
    ) as unknown as multer.Options['fileFilter'],
    limits: { fileSize: size * 1024 * 1024 },
  });
};

export const uploadNoFile = upload().none();
export const uploadSingleUserPhoto = upload({
  category: Category.User,
  directory: FilesDirectory.UserPhoto,
  fileType: FileType.Image,
}).single('photo');

export { FilesDirectory, Upload };
