var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId

module.exports = {
    getAllProducts:(category=0,skipNo=0)=>{
       
        return new Promise (async(resolve,reject)=>{

            if(category === 'All Products' || category == 0){

                let proQty = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({listed:true})

                if(skipNo == '0'){

                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({listed:true}).limit(8).sort({_id:-1}).toArray()
                    resolve([products,proQty])
                }else{
                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({listed:true}).limit(8).skip(skipNo*8).sort({_id:-1}).toArray()
                    resolve([products,proQty])
                }

            }else if(category === 'Top Selling'){
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({listed:true}).sort({count:-1}).limit(4).toArray()
                resolve([products,proQty=8])
            }else{

                let proQty = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({category:category,listed:true})  

                if(skipNo == '0'){

                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category,listed:true}).limit(8).sort({_id:-1}).toArray()
                    resolve([products,proQty])
                }else{
                    let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category,listed:true}).limit(8).skip(skipNo*8).sort({_id:-1}).toArray()
                    resolve([products])
                }
                
            }
        })
    },
    searchKeyByName:(category=0,keyWord)=>{
        return new Promise (async(resolve,reject)=>{
            const regex = new RegExp(keyWord, 'i');
            if(category == 'All Products' || category == 0){
                let searchResult = await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{name:{$regex:regex}},{brand:{$regex:regex}}]}).limit(5).toArray()
                resolve(searchResult)
            }else if(category === 'Top Selling'){
                let searchResult = await db.get().collection(collection.PRODUCT_COLLECTION).find({$or:[{name:{$regex:regex}},{brand:{$regex:regex}}]}).sort({count:-1}).limit(5).toArray()
                resolve(searchResult)
            }else{
                let searchResult = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category,$or:[{name:{$regex:regex}},{brand:{$regex:regex}}]}).limit(5).toArray()
                resolve(searchResult)
            }
        })
    },
    stockChecking:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((response)=>{
                if(response){
                    response = response.quantity
                }else{
                    response = 0
                }
                resolve(response)
            })
        })
    },
    cartChecking:(userId,proId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartProduct = await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId),'cart._id':objectId(proId)}).project({_id:0,'cart.$':1}).next()
            let cartQty = 0;
            if(cartProduct){
                cartQty = cartProduct.cart[0].quantity
            }
            resolve(cartQty)
        })
    },
    cartStockChecking:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            const cartData = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                  $match: {
                    _id: objectId(userId),
                  },
                },
                {
                  $unwind: {
                    path: "$cart",
                  },
                },
                {
                  $project: {
                    _id: 0,
                    _id: "$cart._id",
                    quantity: "$cart.quantity",
                  },
                },
            ]).toArray()
            

            let checkedArray = [];
            for(let i=0;i < cartData.length;i++){
                await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(cartData[i]._id),quantity:{$lt:(cartData[i].quantity)}}).then((data)=>{
                    if(data){
                        checkedArray.push({name:data.name,qty:data.quantity})
                    }
                })
            }

            resolve(checkedArray)
        })
    },
    getAllProductsMen:()=>{
        return new Promise (async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{category:"Men"},{listed:true}]}).toArray()
            resolve(products)
        })
    },
    getAllProductsWomen:()=>{
        return new Promise (async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({$and:[{category:"Women"},{listed:true}]}).toArray()
            resolve(products)
        })
    },
    addProduct:(product)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then(()=>{
                resolve()
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    listUnlistProduct:(proData)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(proData);
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proData.id)},{$set:{listed:(proData.status)}}).then(()=>{
                resolve()
            })
        })
    },
    addToListProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{listed:true}}).then(()=>{
                resolve()
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    category:proDetails.category,
                    subCategory:proDetails.subCategory,
                    brand:proDetails.brand,
                    name:proDetails.name,
                    specification:proDetails.specification,
                    images:proDetails.images,
                    quantity:proDetails.quantity,
                    price:proDetails.price
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    addCategory:(mainCategory)=>{
        return new Promise(async(resolve,reject)=>{
            let categoryExists = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:mainCategory.category})
            if(!categoryExists){
                await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(mainCategory).then(()=>{
                    resolve(categoryExists = false)
                })
            }else{
                resolve(categoryExists = true)
            }
        })
    },
    categoryExistance:(subCategory)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_SUB_COLLECTION).findOne({categoryId:subCategory.categoryId,subCategory:subCategory.subCategory}).then((category)=>{
                resolve(category)
            })
        })
    },
    addSubCategory:(subCategory)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_SUB_COLLECTION).insertOne(subCategory).then(()=>{
                resolve()
            })
        })
    },
    getAllCategories:(categoryName)=>{
        return new Promise (async(resolve,reject)=>{
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            if(categoryName){
                let subCategory = await db.get().collection(collection.CATEGORY_SUB_COLLECTION).find({category:categoryName}).toArray()
                resolve(response={category,subCategory})
            }else{
                let subCategory = await db.get().collection(collection.CATEGORY_SUB_COLLECTION).find().toArray()
                resolve(response={category,subCategory})
            }
        })
    },
    getCategoryDetails:(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_SUB_COLLECTION).findOne({_id:objectId(categoryId)}).then((subCategory)=>{
                resolve(subCategory)
            })
        })
    },
    updateCategory:(id,categoryDetails)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_SUB_COLLECTION)
            .updateOne({_id:objectId(id)},{
                $set:{
                    subCategory:categoryDetails.subCategory
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    unlistListCategory:(categoryData)=>{
        return new Promise(async(resolve,reject)=>{
            if(categoryData.listed == 'true'){
                categoryData.listed = true
            }else{
                categoryData.listed = false
            }
            
            await db.get().collection(collection.CATEGORY_SUB_COLLECTION).updateOne({_id:objectId(categoryData.id)},{$set:{listed:(categoryData.listed)}}).then(()=>{
                resolve()
            })
        })
    },
    addToListCategory:(categoryId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(categoryId)},{$set:{listed:true}}).then((response)=>{
                resolve(response)
            })
        })
    },
    addToCart:(userId,proId,proQty)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
            let cartProduct = await db.get().collection(collection.USER_COLLECTION).findOne({$and:[{_id:objectId(userId)},{"cart._id":objectId(proId)}]})

            if(cartProduct){
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId),'cart._id':objectId(proId)},{$inc:{'cart.$.quantity':proQty}}).then((response)=>{
                    resolve(response)
                })
            }else{
                product.quantity = proQty
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$addToSet:{cart:product}}).then(async (response)=>{
                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                    response.cartCount = user.cart.length;
                    resolve(response)
                })
            }
        })
    },
    getCart:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            var sum = await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(userId) }
                },
                {
                    $unwind: '$cart'
                },
                {
                    $project: {
                        quantity: '$cart.quantity',
                        price: "$cart.price",_id:0
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity','$price'] } }
                    }
                }
            ]).toArray()

            await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((response)=>{

                if(response.cart[0]){
                    sum = sum[0].total
                    sum = Math.round(sum*100)/100
                    response.sum = sum
                }
                resolve(response)
            })
        })
    },
    updateCart:(userId,proId,proQty)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId),'cart._id':objectId(proId)},{$set:{'cart.$.quantity':proQty}}).then((response)=>{                
                resolve(response)
            })
        })
    },
    deleteProduct:(userId,proId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$pull:{cart:{_id:objectId(proId)}}}).then(async (response)=>{
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
                response.cartCount = user.cart.length;
                resolve(response)
            })
        })
    }
}