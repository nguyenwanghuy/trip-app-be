import jwt from 'jsonwebtoken'
import PostModel from '../models/postModel.js';

 export const authMiddleware = (req, res, next) => {
    const token = req.headers["x-access-token"];
    
    if (!token) {
      return res.status(400).json({
        message: "Token is not provided",
      });
    }
  
    try {
      const decoded = jwt.verify(token,process.env.SECRET_KEY)
      req.user = decoded;
      next()
    } catch (error) {
      return res.status(400).json({
          error
      })
    }
  };
  export const verifyTokenPost = (req, res, next) => {
    authMiddleware(req, res,async() => {
      const postId = req.params.id;
      const post = await PostModel.findById(postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const postUserId = post.user;
      
      // console.log('req.user.id:', req.user.id);
      // console.log('postUserId:', postUserId);
      if (req.user.id === postUserId.toString() || req.user.admin) {
        next();
      } else {
        return res.status(403).json({ message: 'You are not allowed to delete this post' });
      }
    });
  };

  export const verifyTokenUser = (req, res,next) => {
    authMiddleware(req, res,()=>{
      if(req.user.id === req.params.id ||req.user.admin) {
        next();
      } else{
        res.status(403).json("You're not allowed to do that user!");
      }
    })
  };
 
