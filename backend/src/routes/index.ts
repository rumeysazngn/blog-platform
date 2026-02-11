
import { Router } from "express";
import users from "./users.routes";
import posts from "./posts.routes";
import comments from "./comments.routes";
import auth from "./auth.routes";
import likes from "./likes.routes";
import categoryRoutes from "./categories.routes";

import adminCategories from "./admin.categories.routes";
import adminRoutes from "./admin.routes"
import adminCategoryRoutes from "./admin.categories.routes";
import reports from "./reports.routes";
import adminDashboardRoutes from "./admin.routes";  


const router = Router();

router.use("/users", users);
router.use("/posts", posts);
router.use("/comments", comments);
router.use("/auth", auth);
router.use("/likes", likes);
router.use("/categories", categoryRoutes);
router.use("/admin/categories", adminCategories);
router.use("/admin", adminRoutes);
router.use("/admin/categories", adminCategoryRoutes);
router.use("/admin", adminRoutes);
router.use("/reports", reports);
router.use("/admin", adminDashboardRoutes);
export default router;
