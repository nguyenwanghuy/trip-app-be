import jwt from 'jsonwebtoken'
import PostModel from '../models/postModel.js';
import UserModel from '../models/user.model.js';

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
  export const verifyTokenPost = async (req, res, next) => {
    try {
      await authMiddleware(req, res, async () => {
        const postId = req.params.id;
        const post = await PostModel.findById(postId);
        if (!post) {
          return res.status(404).json({ message: 'Post not found' });
        }
        const postUserId = post.user.toString(); 
        
        // console.log('req.user.id:', req.user.id);
        // console.log('postUserId:', postUserId);
        
        const user = await UserModel.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        if (req.user.id === postUserId || user.admin === true) {
          next();
        } else {
          return res.status(403).json({ message: 'You are not allowed to delete this post' });
        }
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
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
 
