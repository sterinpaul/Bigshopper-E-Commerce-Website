var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId

module.exports = {
    userAuth:async(req,res,next)=>{
        
        if(req.session.user){
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(req.session.user._id)})
            if(user.access){
                next()
            }else{
                req.session.user = null
                req.session.blocked = true;
                res.redirect('/signin')
            }
        }else{
            res.redirect('/signin')
        }
    },
    adminAuth:(req,res,next)=>{
        if(req.session.admin){
            next()
        }else{
            res.redirect('/admin')
        }
    }
}