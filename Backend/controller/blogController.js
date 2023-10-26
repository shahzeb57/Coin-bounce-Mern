const Joi = require("joi");
const fs = require("fs");
const Blog = require("../models/blog");
const { Backend_Server_Path } = require("../config/index");
const BlogDTO = require("../dto/blog");
const BlogDetailsDTO = require("../dto/blog-details");
const { validate } = require("../models/user");
const Comment =require("../models/comment")
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  // ***********************************************************************************************************?
  async create(req, res, next) {
    // 1 : validate req body

    // 2:   handle photo path

    // 3:   save it to db

    // 4:   return
    // photo come from client side as base64 encoded string->decode-> store-> svae  photo,s path to db

    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      content: Joi.string().required(),
      photo: Joi.string().required(),
    });
    const { error } = createBlogSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { title, author, content, photo } = req.body;

    // for photos following steps req
    // 1: read as buffer
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(jpg|jpeg|png);base64,/, ""),
      "base64"
    );
    //  2: gave a random name
    const imagePath = `${Date.now()}-${author}.png`;
    // 3: save locally
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }
    // save blog in DB
    let newBlog;
    try {
      newBlog = new Blog({
        title,
        author,
        content,
        photoPath: `${Backend_Server_Path}/storage/${imagePath}`,
      });
      await newBlog.save();
    } catch (error) {
      return next(error);
    }
    const blogDTO = new BlogDTO(newBlog);
    return res.status(201).json({ blog: blogDTO });
  },

  // ***********************************************************************************************************?
  async getAll(req, res, next) {
    try {
      const blogs = await Blog.find({});

      const blogsDto = [];
      for (let i = 0; i < blogs.length; i++) {
        const dto = new BlogDTO(blogs[i]);
        blogsDto.push(dto);
      }
      return res.status(200).json({ blogs: blogsDto });
    } catch (error) {
      return next(error);
    }
  },

  // ***********************************************************************************************************?
  async getById(req, res, next) {
    const getByIdSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });
    const { error } = getByIdSchema.validate(req.params);

    if (error) {
      return next(error);
    }
    let blog;
    const { id } = req.params;

    try {
      blog = await Blog.findOne({ _id: id }).populate("author");
    } catch (error) {
      return next(error);
    }
    const blogDTO = new BlogDetailsDTO(blog);
    return res.status(200).json({ blog: blogDTO });
  },

  // ***********************************************************************************************************?

  async update(req, res, next) {
    // 1 :validate
    const updateBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      blogId: Joi.string().regex(mongodbIdPattern).required(),
      photo: Joi.string(),
    });
    const { error } = updateBlogSchema.validate(req.body);
    const { title, content, author, blogId, photo } = req.body;

    // const { error } = updateBlogSchema.validate(req.body);

    // const { title, content, author, blogId, photo } = req.body;


    // if update photo
    // delte prvious photo
    // save new photo
    let blog;
    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
        return next(error);
    }
    if (photo) {
        // get photo 
       let  previousPhoto= blog.photoPath

       previousPhoto=previousPhoto.split('/').at(-1); 
    //    delete photo here 
fs.unlinkSync(`storage/${previousPhoto}`)
       // store new photo 



 // for photos following steps req
    // 1: read as buffer
    const buffer = Buffer.from(
        photo.replace(/^data:image\/(jpg|jpeg|png);base64,/, ""),
        "base64"
      );
      //  2: gave a random name
      const imagePath = `${Date.now()}-${author}.png`;
      // 3: save locally
      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }

     await Blog.updateOne({_id: blogId },
        {title,content,photoPath:`${Backend_Server_Path}/storage/${imagePath}`}
        )

    } else {
        await Blog.updateOne({_id:blogId},{title,content,});

    }

    return res.status(200).json({messge:'blog updated'});
  },



  // ***********************************************************************************************************?
  async delete(req, res, next) {

const deleteBlogSchema=Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required()
});

const {error}= deleteBlogSchema.validate(req.params);
const {id}= req.params;

// delete blog and vcomments
try {
    
 await Blog.deleteOne({_id:id});

 await Comment.deleteMany({blog:id});
} catch (error) {
           return next(error); 
}

return res.status(200).json({messge:'blog deleted'});
  },
  // ***********************************************************************************************************?
};

module.exports = blogController;
