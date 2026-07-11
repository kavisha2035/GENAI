
const userModel=require("../models/user.model")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const tokenBlacklistModel=require("../models/blacklist.model")

const ACCESS_TOKEN_EXPIRY = "15m"
const REFRESH_TOKEN_EXPIRY = "7d"

function generateTokenPair(user) {
    const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    )
    const refreshToken = jwt.sign(
        { id: user._id, username: user.username, isRefresh: true },
        process.env.JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    )
    return { accessToken, refreshToken }
}

function setTokenCookies(res, accessToken, refreshToken) {
    const isProd = process.env.NODE_ENV === "production"
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 15 * 60 * 1000  // 15 minutes
    }
    res.cookie("token", accessToken, cookieOptions)
    res.cookie("refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    })
}

/**
 * @name registeruserController
 * @description register a new user , expects a username , email and password in the required manner
 * @access public 
 */
async function registerUserController(req,res){
    const{username,email,password}=req.body
    if(!username || !email ||!password){
        // ADDED RETURN HERE TO STOP EXECUTION
        return res.status(400).json({
            message:"Please provide the username, email and password."
        })
    }

    const isUserAlreadyExists=await userModel.findOne({
        $or:[{username},{email}]
    })

    if(isUserAlreadyExists){
        // ADDED RETURN HERE TO STOP EXECUTION
        return res.status(400).json({
            message:"Account already exists with this username or the email"
        })
    }

    const hash=await bcrypt.hash(password,10)
    const user=await userModel.create({
        username,
        email,
        password:hash
    })

    const { accessToken, refreshToken } = generateTokenPair(user)
    setTokenCookies(res, accessToken, refreshToken)

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email 

        }
    })
}

/**
 * @name loginUserController
 * @description login a user expects the email passowrd in the request body 
 * @access public
 */
async function loginUserController(req,res){
    const {email,password}=req.body
    const user=await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }
    const isPasswordValid=await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }

    const { accessToken, refreshToken } = generateTokenPair(user)
    setTokenCookies(res, accessToken, refreshToken)

    res.status(201).json({
        message:"User loggedIn successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email 

        }
    })
}

async function logoutUserController(req,res){
    // CHANGED res.cookies TO req.cookies
    const token=req.cookies?.token 
    const refreshToken=req.cookies?.refreshToken
    if(token){
        await tokenBlacklistModel.create({token})
    }
    if(refreshToken){
        await tokenBlacklistModel.create({token: refreshToken})
    }
    const isProd = process.env.NODE_ENV === "production"
    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax"
    }
    res.clearCookie("token", cookieOptions)
    res.clearCookie("refreshToken", cookieOptions)
    res.status(200).json({
        message:"User logged out successfully"
    })
}

/**
 * @name refreshTokenController
 * @description Refresh the access token using the refresh token cookie.
 * @access public (requires valid refresh token)
 */
async function refreshTokenController(req, res) {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not provided." })
    }

    // Check if refresh token is blacklisted
    const isBlacklisted = await tokenBlacklistModel.findOne({ token: refreshToken })
    if (isBlacklisted) {
        return res.status(401).json({ message: "Refresh token is invalid." })
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

        if (!decoded.isRefresh) {
            return res.status(401).json({ message: "Invalid token type." })
        }

        const user = await userModel.findById(decoded.id)
        if (!user) {
            return res.status(401).json({ message: "User not found." })
        }

        // Blacklist old refresh token (rotation)
        await tokenBlacklistModel.create({ token: refreshToken })

        // Generate new token pair
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokenPair(user)
        setTokenCookies(res, newAccessToken, newRefreshToken)

        res.status(200).json({
            message: "Token refreshed successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        return res.status(401).json({ message: "Refresh token expired. Please log in again." })
    }
}

async function getMeController(req,res){
    const user=await userModel.findById(req.user.id) // we are getting the id from the middlware 
    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email
        }
    })
}

module.exports={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    refreshTokenController
}
