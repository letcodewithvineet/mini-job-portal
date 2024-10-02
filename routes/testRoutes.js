import express from "express";
import { testPostController } from "../controllers/testController.js";
import userAuth from "../middlewares/authMiddleware.js";

//routes object
const router = express.Router();

//routes
router.post("/test-post", userAuth, testPostController);

//export
export default router;
