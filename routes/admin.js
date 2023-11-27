// const { response } = require('express');
var express = require('express');
const adminController = require("../controls/admin-controls")
const imgUpload = require('../multer/multer')
var router = express.Router();
const authenticate = require('../middleware/middleware')


/* GET Admin page. */
router.get('/',adminController.getAdminSignin);

/* POST Admin Dashboard */
router.post('/signin',adminController.postAdminSignin);

/* GET Admin Dashboard page. */
router.get('/dashboard',authenticate.adminAuth,adminController.getAdminDashboard);

// Admin Sign-out
router.get('/admin-signout',authenticate.adminAuth,adminController.adminSignout);

// GET Admin User management
router.get('/user-management',authenticate.adminAuth,adminController.getUserManagement);

/* GET Edit User page. */
router.get('/edit-user/',authenticate.adminAuth,adminController.getEditUser)

// POST Edit User Page
router.post('/edit-user/:id',authenticate.adminAuth,adminController.postEditUser)

/* Block a User */
router.get('/block-user/',authenticate.adminAuth,adminController.blockUser)

/* Unblock a User */
router.get('/unblock-user/',authenticate.adminAuth,adminController.unBlockUser)

// Get Product page
router.get('/product-management',authenticate.adminAuth,adminController.getProductManagement);

// Search products by Name
router.get('/searchByName',authenticate.adminAuth,adminController.searchByName)

// GET Add-Product Page
router.get('/add-product',authenticate.adminAuth,adminController.getAddProduct);

// Submit Add Product Page
router.post('/add-product',authenticate.adminAuth,imgUpload.uploads,adminController.postAddProduct);

/* Unlist a product. */
router.get('/listUnlist-product',authenticate.adminAuth,adminController.listUnlistProduct)

/* Add to list a product. */
router.get('/addToList-product',authenticate.adminAuth,adminController.listProduct)

/* GET Edit product page. */
router.get('/edit-product/',authenticate.adminAuth,adminController.getEditProduct)

// POST Edit Product Page
router.post('/edit-product/:id',authenticate.adminAuth,imgUpload.editeduploads,adminController.postEditProduct)

// GET Categories Page
router.get('/category-management',authenticate.adminAuth,adminController.getCategoryManagement);

// GET Category according to the selection
router.get('/selectCategory-addProduct',authenticate.adminAuth,adminController.selectCategoryAddProduct)

// Submit Add Category Page
router.post('/add-category',authenticate.adminAuth,adminController.postAddCategory);

// Submit Add Category Page
router.post('/add-subCategory',authenticate.adminAuth,adminController.postAddSubCategory);

/* GET Edit Category page. */
router.get('/edit-category/',authenticate.adminAuth,adminController.getEditCategory)

// POST Edit Category Page
router.post('/edit-category',authenticate.adminAuth,adminController.postEditCategory)

/* Unlist a Category. */
router.get('/listUnlist-category',authenticate.adminAuth,adminController.listUnlistCategory)

/* Add to list Category. */
router.get('/addToList-category/',authenticate.adminAuth,adminController.listCategory)

// GET Order Management
router.get('/order-management',authenticate.adminAuth,adminController.getOrderManagement);

// GET View single order page
router.get('/viewOrderDetails',authenticate.adminAuth,adminController.getVieworder)

// Change Order Status
router.post('/changeOrderStatus',authenticate.adminAuth,adminController.changeStatus)

// GET Sales report
router.get('/sales-report',authenticate.adminAuth,adminController.getSalesReport)

// GET Coupon Management
router.get('/coupon-management',authenticate.adminAuth,adminController.getCouponManagement)

// Adding Coupon
router.post('/add-coupon',authenticate.adminAuth,adminController.addCoupon)

// Get Edit Coupon
router.get('/edit-coupon',authenticate.adminAuth,adminController.getEditCoupon)

// Post Edit Coupon
router.post('/edit-coupon',authenticate.adminAuth,adminController.postEditCoupon)

// Delete Coupon
router.get('/blockUnblock-coupon',authenticate.adminAuth,adminController.listUnlistCoupon)

module.exports = router;