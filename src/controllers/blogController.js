const jwt = require("jsonwebtoken")
const authorModel = require("../models/authorModel")
const blogModel = require("../models/blogModel")
const BlogModel= require("../models/blogModel")
const moment = require('moment')

let time = moment().format('YYYY-MM-DDTHH:MM:ss.SSS')

const createBlog = async function (req, res) {

    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Body must require" })
        let validAuthor = await authorModel.findById({ _id: data.authorId })

        if (validAuthor === null) return res.status(400).send({ status: false, msg: "Author Id not valid" })

        if (data.isPublished == true) data.publishedAt = time
        let savedData = await blogModel.create(data)
        res.status(201).send({ status: true, data: savedData })
    }

    catch (error) {
        res.status(400).send({ status: false, msg: error.message })
    }

}

 //*********************************************************************************************************** */


const updateBlogs = async function (req, res) {
    try {
        let time = moment()

        let publishedAt = time.format('YYYY-mm-ddTHH:MM:ssZ')

        let isPublished = req.body.isPublished
        let isDeleted = req.body.isDeleted
        var blogId = req.params.blogId
        let gotblog = await blogModel.find({ _id: blogId, isDeleted: false })
        if (!gotblog) return res.status(404).send("No blogs exist")

        if (isPublished === true) {
            req.body.publishedAt = publishedAt
            let detailsToUpdate = req.body
            var updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, detailsToUpdate, { new: true })
            res.status(200).send({ status: true, data: updatedBlog })
        }
        else {
            req.body.publishedAt = " "
            detailsToUpdate = req.body
            var updatedBlog = await blogModel.findOneAndUpdate({ _id: blogId }, detailsToUpdate, { new: true })
            res.status(200).send({ status: true, data: updatedBlog })
        }
    }

    catch (err) {
        res.status(400).send({ status: false, msg: err.message })

    }
}

//************************************************************************************************************* */

const deleteBlogs = async function (req, res) {
    try {
        let id = req.params.blogId
        let allBlogs = await blogModel.findOneAndUpdate({ _id: id, isDeleted: false }, { $set: { isDeleted: true, deletedAt: time } }, { new: true,upsert:true })
        if (allBlogs) res.status(200).send({ status: true, data: allBlogs })
        else res.status(404).send({ status: false, msg: "No Blogs Exist" })
    } 
    catch (err) {
        res.status(400).send({ status: false, msg: err.message })
    }
}

//**************************************************************************************************************************************************************************** */

const deleteBlogsByFields = async function (req, res) {
    try {
        let data = req.query
        data.isDeleted = false
        let any = await BlogModel.find(data)
        if (Object.keys(any).length !== 0) {
            let all = await blogModel.updateMany(data, { $set: { isDeleted: true, deletedAt : time } }, { new: true,upsert:true })
            res.status(200).send({ status: true, data: all })
        }
        else res.status(404).send({ status: false, msg: "No Blogs Exist" })
    } catch (err) {
        res.status(400).send({ status: false, msg: err.message })
    }
}

//***************************************************************************************************************************************************** */

const getBlog = async function (req, res) {
    try {
        let data = req.query
        if (Object.keys(data).length === 0) {
            let allBlogs = await blogModel.find({ isPublished: true, isDeleted: false })
            if (allBlogs.length == 0) return res.status(404).send({ status: false, msg: "not found" })
            return res.status(200).send({ status: true, data: allBlogs })
        }

        let filterBlogs = await blogModel.find({ $and: [data, { isPublished: true }, { isDeleted: false }] })

        if (filterBlogs.length === 0) return res.status(404).send({ status: false, msg: "data not found" })


        res.status(200).send({ status: true, data: filterBlogs })
    }
    catch (error) {
        res.status(400).send({ status: false, msg: error.message })
    }

}

//*************************************************************************************************************** */

const loginAuthor = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if (!email) return res.status(400).send({ status: false, msg: "plz enter email" })
        if (!password) return res.status(400).send({ status: false, msg: "plz enter password" })
        let valid = await authorModel.findOne({ email: email, password: password })
        if (!valid) {
            return res.status(404).send({ status: false, msg: "email or password is wrong" })
        }
        let token = jwt.sign({                     // On successfull login, JWT will create.
            authorId: valid._id.toString(),
            group: 25,                 // Group-25 is the secret key
            batch: "uranium"           // ( Group-25 and batch:Uranium )...this are two key value pair in payload.
        }, "group-25")
        res.setHeader("x-api-key", token)
        res.status(200).send({ status: true, data: token })
    }
    catch (error) {
        res.status(400).send({ status: false, msg: error.message })
    }
}




module.exports.loginAuthor = loginAuthor
module.exports.getBlog = getBlog
module.exports.createBlog = createBlog
module.exports.deleteBlogsByFields = deleteBlogsByFields
module.exports.updateBlogs = updateBlogs
module.exports.deleteBlogs = deleteBlogs

