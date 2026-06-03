const express=require("express")
const authRouter=express.Router()
const authController=require("../controllers/auth.controller")
const authMiddleware=require("../middlewares/auth.middleware")



/**
 * @route POST
 * @description
 * @access
 */
authRouter.post("/register",authController.registerUserController)

/**
 * @route POST /api/auth/login
 * @description logina new user 
 * @access public
 */
authRouter.post("/login",authController.loginUserController)

/**
 * @route POST/api/auth/logout
 * @description performing token blacklisting
 * @access public 
 */

authRouter.get("/logout",authController.logoutUserController)


/**
 * @route GET/api/auth/get-me
 * @description get the current logged in user details
 * @access public 
 */

authRouter.get("get-me",authMiddleware.authUser,authController.getMeController)

 module.exports=authRouter