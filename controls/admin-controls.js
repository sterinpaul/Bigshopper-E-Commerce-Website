const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const { ObjectId } = require('mongodb');

var admin = false;
var adminLog = false;


module.exports = {
    /* GET Admin page. */
    getAdminSignin:(req, res)=>{
        if(req.session.admin){
            res.redirect('/admin/dashboard');
        }else{
            res.render('admin/signin', { title: 'BigShopper Admin',admin:true});
        }
    },
    /* POST Admin Dashboard */
    postAdminSignin:(req,res)=>{
        if(req.body.email === process.env.ADMIN_EMAIL_DB && req.body.password === process.env.ADMIN_PASSWORD_DB || req.session.user === true){
            req.session.admin = req.body.email;
            adminLog = true
            res.redirect('/admin/dashboard');
        }else{
            res.redirect('/admin');
        }
    },
    /* GET Admin Dashboard page. */
    getAdminDashboard:async(req,res)=>{
        let totalSales = await adminHelpers.getTotalOrders()
        let monthlySales = await adminHelpers.getMonthlySales()
        let categoryData = await adminHelpers.getCategorywiseData()

        let avgMonthSale = Math.round(totalSales?.total/totalSales?.months)
        let productsCount = categoryData[0]?.totalNum + categoryData[1]?.totalNum
        res.render('admin/dashboard', { title: 'BigShopper Admin',admin:true,adminLog:true,totalSales,categoryData,productsCount,avgMonthSale,monthlySales,dashPage:true});
    },
    // Admin Sign-out
    adminSignout:(req,res)=>{
        req.session.admin = null;
        adminLog = false
        res.redirect('/admin');
    },
    // GET Admin User management
    getUserManagement:(req,res)=>{
        
        userHelpers.getAllUsers().then((users)=>{
            res.render('admin/users', { title: 'BigShopper Admin',admin:true,adminLog:true,users,userPage:true});
        })

    },
    /* GET Edit User page. */
    getEditUser:async(req,res)=>{
        let user = await userHelpers.getUserDetails(req.query.id)
        
        res.render('admin/edit-user',{ title: 'BigShopper Admin',admin:true,adminLog:true,user,userPage:true})

    },
    // POST Edit User Page
    postEditUser:(req,res)=>{
        userHelpers.updateUser(req.params.id,req.body).then(()=>{
            res.redirect('/admin/user-management')
        })
    },
    /* Block a User */
    blockUser:(req,res)=>{
        let userId = req.query.id
        userHelpers.blockUser(userId).then((response)=>{
            res.redirect('/admin/user-management')
        })
    },
    /* Unblock a User */
    unBlockUser:(req,res)=>{
        let proId = req.query.id
        userHelpers.unBlockUser(proId).then((response)=>{
            res.redirect('/admin/user-management')
        })
    },
    // Get Product page
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
    // Search products by Name
    searchByName:(req,res)=>{
        productHelpers.searchKeyByName(req.query.category,req.query.keyWord).then((response)=>{
            res.json(response)
        })
    },
    // GET Add-Product Page
    getAddProduct:(req,res)=>{
        productHelpers.getAllCategories().then((response)=>{
            res.render('admin/add-product', { title: 'BigShopper Admin',admin:true,adminLog:true,response,proPage:true});
        })
    },
    // Submit Add Product Page
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
    /* Unlist a product. */
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
    /* Add to list a product. */
    listProduct:(req,res)=>{
        productHelpers.addToListProduct(req.query.id).then(()=>{
            res.redirect('/admin/product-management')
        })
    },
    /* GET Edit product page. */
    getEditProduct:async(req,res)=>{
        let product = await productHelpers.getProductDetails(req.query.id)
        let category = product.category
        productHelpers.getAllCategories(category).then((response)=>{
            res.render('admin/edit-product',{ title: 'BigShopper Admin',admin:true,adminLog:true,product,response,proPage:true})
        })

    },
    // POST Edit Product Page
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
    // GET Category according to the selection
    selectCategoryAddProduct:(req,res)=>{
        adminHelpers.selectCategoryDetails(req.query.id).then((subCategory)=>{
            res.json(subCategory)
        })
    },
    // GET Categories Page
    getCategoryManagement:(req,res)=>{
        productHelpers.getAllCategories().then((response)=>{
            res.render('admin/categories', { title: 'BigShopper Admin',admin:true,adminLog:true,response,catPage:true});
        })
    },
    // Submit Add Category Page
    postAddCategory:(req,res)=>{
        req.body.listed = true
        productHelpers.addCategory(req.body).then((categoryExists)=>{
            res.json(categoryExists)
        }).catch((err)=>{
            console.log(err);
        })
    },
    // Submit Add Category Page
    postAddSubCategory:async(req,res)=>{
        req.body.categoryId = ObjectId(req.body.categoryId)
        let subCategoryExists = await productHelpers.categoryExistance(req.body)
        
        if(!subCategoryExists){
            req.body.listed = true
            productHelpers.addSubCategory(req.body).then(()=>{
                // res.redirect('/admin/category-management')
                res.json({subCategory : false})
            })
        }else{
            res.json({subCategory : true})
        }
    },
    /* GET Edit Category page. */
    getEditCategory:async(req,res)=>{
        await productHelpers.getCategoryDetails(req.query.id).then((subCategory)=>{
            res.json(subCategory)
        })
    },
    // POST Edit Category Page
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
    /* Unlist a Category. */
    listUnlistCategory:(req,res)=>{
        productHelpers.unlistListCategory(req.query).then(()=>{
            res.json({status:true})
        })
    },
    /* Add to list Category. */
    listCategory:(req,res)=>{
        let categoryId = req.query.id
        productHelpers.addToListCategory(categoryId).then(()=>{
            res.redirect('/admin/category-management')
        })
    },
    // GET Order Management
    getOrderManagement:(req,res)=>{
        adminHelpers.adminOrdersList().then((orders)=>{
            res.render('admin/orders', { title: 'BigShopper Admin',admin:true,adminLog:true,orders,orderPage:true});
        })
    },
    // GET View single order page
    getVieworder:(req,res)=>{
        userHelpers.orderDetails(req.query.id).then((order)=>{
            res.render('admin/viewOrder',{title: 'BigShopper Admin',admin:true,adminLog:true,order,orderPage:true})
        })
    },
    // Change Order Status
    changeStatus:(req,res)=>{
        userHelpers.changeOrderStatus(req.query.id,req.body).then(()=>{
            res.json({status:true})
        })
    },
    // GET Sales report
    getSalesReport:(req,res)=>{
        adminHelpers.salesReport(req.query).then((orders)=>{
            if(req.query.fromDate){
                res.json(orders)
            }else{
                res.render('admin/sales-report',{ title: 'BigShopper Admin',admin:true,adminLog:true,orders,dashPage:true})
            }
        })
    },
    // GET Coupon Management page
    getCouponManagement:(req,res)=>{
        adminHelpers.getCouponsPage().then((coupons)=>{
            res.render('admin/coupons', { title: 'BigShopper Admin',admin:true,adminLog:true,coupons,couponPage:true});
        })
    },
    // Adding Coupon by admin
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
    // Get Edit Coupon
    getEditCoupon:(req,res)=>{
        adminHelpers.getCouponEdit(req.query.id).then((couponData)=>{
            res.json(couponData)
        })
    },
    // Post Edit and update Coupon
    postEditCoupon:(req,res)=>{
        adminHelpers.postCouponEdit(req.query.id,req.body).then(()=>{
            res.json({status:true})
        })
    },
    // Delete Coupon
    listUnlistCoupon:(req,res)=>{
        adminHelpers.couponListUnlist(req.query).then(()=>{
            res.json({status:true})
        })
    }
}