import { Router } from "express";
import { MessageControllers } from "./message.controller";
import validateRequest from "../../middlewares/validateRequest";
import { MessageValidation } from "./message.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = Router();

router.get("/messages", auth(USER_ROLES.USER, USER_ROLES.ADMIN), MessageControllers.getAllMessage);
router.post(
  "/message-with-image",
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  fileUploadHandler,
  (req: any, res: any, next: any) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  MessageControllers.createMessageWithImage
);
export const MessageRoutes:Router = router;