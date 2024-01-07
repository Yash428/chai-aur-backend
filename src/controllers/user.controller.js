import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "json-web-token"
import mongoose from "mongoose";

const registerUser = asyncHandler( async (req,res)=>{
    // get user details from frontend
    //validation
    //check if user already exists: username, email
    // check for images, check for avatar
    //upload them to cloudinary
    //check if avatar is uploaded on multer, cloudinary
    //create userObject  - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    // return res

    const {fullName, email,username,password, } = req.body
    console.log("email: ",email);
    if(
        [fullName,email,username,password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All Fields are compulsory")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists")
    }
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverimageLocalPath =  req.files?.coverImage[0].path
    let coverimageLocalPath;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverimageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
        
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser,"user registered succesfully")
    )

})

const loginUser  = asyncHandler(async (req,res)=>{
    //req body -> data
    //username or email is there
    //find user
    //if not throw error
    //password check
    //access and refresh token 
})
export {
    registerUser,
    loginUser
}