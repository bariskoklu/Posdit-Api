import express from "express";

import authentication from "./authentication";
import post from "./post";
import comment from "./comment";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  post(router);
  comment(router);

  return router;
}