const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const { ObjectId } = require('mongodb');

var admin = false;
var adminLog = false;

const emailDB = "sterinpaul@gmail.com"
const passwordDB = "admin"

module.exports = {
    getAdminSignin:(req, res)=>{
        if(req.session.admin){
            res.redirect('/admin/dashboard');
        }else{
            res.render('admin/signin', { title: 'BigShopper Admin',admin:true});
        }
    },
    postAdminSignin:(req,res)=>{
        if(req.body.email === emailDB && req.body.password === passwordDB || req.session.user === true){
            req.session.admin = req.body.email;
            adminLog = true
            res.redirect('/admin/dashboard');
        }else{
            res.redirect('/admin');
        }
    },
    getAdminDashboard:async(req,res)=>{
        let totalSales = await adminHelpers.getTotalOrders()
        let monthlySales = await adminHelpers.getMonthlySales()
        let categoryData = await adminHelpers.getCategorywiseData()

        let avgMonthSale = Math.round(totalSales.total/totalSales.months)
        let productsCount = categoryData[0].totalNum + categoryData[1].totalNum
        res.render('admin/dashboard', { title: 'BigShopper Admin',admin:true,adminLog:true,totalSales,categoryData,productsCount,avgMonthSale,monthlySales,dashPage:true});
    },
    adminSignout:(req,res)=>{
        req.session.admin = null;
        adminLog = false
        res.redirect('/admin');
    },
    getUserManagement:(req,res)=>{
        // if(req.session.admin){
            userHelpers.getAllUsers().then((users)=>{
                res.render('admin/users', { title: 'BigShopper Admin',admin:true,adminLog:true,users,userPage:true});
            })
        // }else{
            // res.redirect('/admin');
        // }
    },
    getEditUser:async(req,res)=>{
        let user = await userHelpers.getUserDetails(req.query.id)
        // if(req.session.admin){
            res.render('admin/edit-user',{ title: 'BigShopper Admin',admin:true,adminLog:true,user,userPage:true})
        // }else{
            // res.redirect('/admin');
        // }
    },
    postEditUser:(req,res)=>{
        userHelpers.updateUser(req.params.id,req.body).then(()=>{
            res.redirect('/admin/user-management')
        })
    },
    blockUser:(req,res)=>{
        let userId = req.query.id
        // if(req.session.admin){
            userHelpers.blockUser(userId).then((response)=>{
                res.redirect('/admin/user-management')
            })
        // }else{
            // res.redirect('/admin');
        // }
    },
    unBlockUser:(req,res)=>{
        let proId = req.query.id
        userHelpers.unBlockUser(proId).then((response)=>{
            res.redirect('/admin/user-management')
        })
    },
    getProductManagement:(req,res)=>{
        let category = req.query.category
        let skip = req.query.skip

        adminHelpers.getAllProducts(category,skip).then(async(response)=>{
            let categoryData = await productHelpers.getAllCategories()
            categoryData = categoryData.category

            products = response[0]
            let qty = response[1]
            if(category === undefined){
                res.render('admin/products', { title: 'BigShopper Admin',admin:true,adminLog:true,products,categoryData,qty,proPage:true});
            }else{
                res.json([products,qty])
            }
        })
    },
    getAddProduct:(req,res)=>{
        productHelpers.getAllCategories().then((response)=>{
            res.render('admin/add-product', { title: 'BigShopper Admin',admin:true,adminLog:true,response,proPage:true});
        })
    },
    postAddProduct:(req,res)=>{
        req.body.quantity = parseInt(req.body.quantity)
        req.body.price = parseFloat(req.body.price)

        let images = req.files.map(files=>files.filename)
        req.body.images = images
        req.body.listed = true
        req.body.count = 0

        productHelpers.addProduct(req.body).then(()=>{
            res.redirect('/admin/product-management')
        })
    },
    listUnlistProduct:(req,res)=>{
        if(req.query.status == 'true'){
            req.query.status = true
        }else{
            req.query.status = false
        }
        productHelpers.listUnlistProduct(req.query).then(()=>{
            res.json({status:true})
        })
    },
    listProduct:(req,res)=>{
        productHelpers.addToListProduct(req.query.id).then(()=>{
            res.redirect('/admin/product-management')
        })
    },
    getEditProduct:async(req,res)=>{
        let product = await productHelpers.getProductDetails(req.query.id)
        let category = product.category
        productHelpers.getAllCategories(category).then((response)=>{
            res.render('admin/edit-product',{ title: 'BigShopper Admin',admin:true,adminLog:true,product,response,proPage:true})
        })

    },
    postEditProduct:async(req,res)=>{
        
        req.body.quantity = parseInt(req.body.quantity)
        req.body.price = parseFloat(req.body.price)

        let product = await productHelpers.getProductDetails(req.params.id)
        let oldImages = product.images
        let [oldFirst,oldSecond,oldThird] = [...oldImages]
 
            let images = []

            if(req.files.image1){
                images[0] = req.files.image1[0].filename
            }else{
                images[0] = oldFirst
            }
            if(req.files.image2){
                images[1] = req.files.image2[0].filename
            }else{
                images[1] = oldSecond
            }
            if(req.files.image3){
                images[2] = req.files.image3[0].filename
            }else{
                images[2] = oldThird
            }
        
        req.body.images = images
        
        productHelpers.updateProduct(req.params.id,req.body).then(()=>{
            res.redirect('/admin/product-management')
        })
    },
    selectCategoryAddProduct:(req,res)=>{
        adminHelpers.selectCategoryDetails(req.query.id).then((subCategory)=>{
            res.json(subCategory)
        })
    },
    getCategoryManagement:(req,res)=>{
        productHelpers.getAllCategories().then((response)=>{
            res.render('admin/categories', { title: 'BigShopper Admin',admin:true,adminLog:true,response,catPage:true});
        })
    },
    postAddCategory:(req,res)=>{
        req.body.listed = true
        productHelpers.addCategory(req.body).then((categoryExists)=>{
            res.json(categoryExists)
        }).catch((err)=>{
            console.log(err);
        })
    },
    postAddSubCategory:async(req,res)=>{
        req.body.categoryId = ObjectId(req.body.categoryId)
        let subCategoryExists = await productHelpers.categoryExistance(req.body)
        
        if(!subCategoryExists){
            req.body.listed = true
            productHelpers.addSubCategory(req.body).then(()=>{
                // res.redirect('/admin/category-management')
                subCategoryExists = false
                res.json(subCategoryExists)
            })
        }else{
            subCategoryExists = true
            res.json(subCategoryExists)
        }
    },
    getEditCategory:async(req,res)=>{
        await productHelpers.getCategoryDetails(req.query.id).then((subCategory)=>{
            res.json(subCategory)
        })
    },
    postEditCategory:async(req,res)=>{
        req.body.categoryId = ObjectId(req.body.categoryId)
        let categoryWithSubCategory = await productHelpers.categoryExistance(req.body)
        if(!categoryWithSubCategory){
            productHelpers.updateCategory(req.query.id,req.body).then(()=>{
                res.json(true)
            })
        }else{
            res.json(false)
        }
    },
    listUnlistCategory:(req,res)=>{
        productHelpers.unlistListCategory(req.query).then(()=>{
            res.json({status:true})
        })
    },
    listCategory:(req,res)=>{
        let categoryId = req.query.id
        productHelpers.addToListCategory(categoryId).then(()=>{
            res.redirect('/admin/category-management')
        })
    },
    getOrderManagement:(req,res)=>{
        adminHelpers.adminOrdersList().then((orders)=>{
            res.render('admin/orders', { title: 'BigShopper Admin',admin:true,adminLog:true,orders,orderPage:true});
        })
    },
    getVieworder:(req,res)=>{
        userHelpers.orderDetails(req.query.id).then((order)=>{
            res.render('admin/viewOrder',{title: 'BigShopper Admin',admin:true,adminLog:true,order,orderPage:true})
        })
    },
    changeStatus:(req,res)=>{
        userHelpers.changeOrderStatus(req.query.id,req.body).then(()=>{
            res.json({status:true})
        })
    },
    getSalesReport:(req,res)=>{
        adminHelpers.salesReport(req.query).then((orders)=>{
            if(req.query.fromDate){
                res.json(orders)
            }else{
                res.render('admin/sales-report',{ title: 'BigShopper Admin',admin:true,adminLog:true,orders,dashPage:true})
            }
        })
    },
    getCouponManagement:(req,res)=>{
        adminHelpers.getCouponsPage().then((coupons)=>{
            res.render('admin/coupons', { title: 'BigShopper Admin',admin:true,adminLog:true,coupons,couponPage:true});
        })
    },
    addCoupon:async(req,res)=>{
        let couponExists = await adminHelpers.checkCouponExistance(req.body.couponCode)
        if(couponExists){
          res.json({exist:true})
        }else{
            adminHelpers.addingCoupon(req.body).then(()=>{
                res.json({exist:false})
            })
        }
    },
    getEditCoupon:(req,res)=>{
        adminHelpers.getCouponEdit(req.query.id).then((couponData)=>{
            res.json(couponData)
        })
    },
    postEditCoupon:(req,res)=>{
        adminHelpers.postCouponEdit(req.query.id,req.body).then(()=>{
            res.json({status:true})
        })
    },
    listUnlistCoupon:(req,res)=>{
        adminHelpers.couponListUnlist(req.query).then(()=>{
            res.json({status:true})
        })
    }
}