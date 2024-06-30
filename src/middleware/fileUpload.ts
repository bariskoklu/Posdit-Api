import multer from 'multer';
import express from 'express';

export const UploadSingle = (
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }
      next();
    });
  }
);