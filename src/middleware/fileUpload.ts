import multer from 'multer';
import express from 'express';

export const UploadSingle = (
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    upload.single('file');
    next();
  }
);