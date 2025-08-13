import { Router } from "express";
import { MessageControllers } from "./message.controller";
import validateRequest from "../../middlewares/validateRequest";
import { MessageValidation } from "./message.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = Router();

router.get("/messages", MessageControllers.getAllMessage);
router.post(
  "/message-with-image",
  fileUploadHandler,
  validateRequest(MessageValidation.createMessage),
  MessageControllers.createMessageWithImage
);
export const MessageRoutes:Router = router;