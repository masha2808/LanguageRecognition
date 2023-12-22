import { diskStorage } from 'multer';

export const multerOptions = {
  storage: diskStorage({
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    },
  }),
};
