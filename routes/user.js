// const { response } = require('express');
// const session = require('express-session');
var express = require('express');
var router = express.Router();
const controller = require("../controls/user-controls")
const authenticate = require('../middleware/middleware')


/* Get Index page */
router.get('/',controller.getIndex)

/* Get Sign-in page */
router.get('/signin',controller.getSignin)

/* POST User Sign-in page */
router.post('/signin',controller.postSignin)

/* Get OTP Sign-in page */
router.get('/signInOtp',controller.getOtpSignin)

// User Sign in with OTP
router.post('/sendOtp',controller.postOtpSignin)

/* Get Sign-up page */
router.get('/signup',controller.getSignup)

/* POST Sign-up page */
router.post('/signup',controller.postSignup)

/* Sign-out from User Page */
router.get('/signout',controller.signOut)

/*  Products Page */
router.get('/products',controller.getProducts)

// Search products by Name
router.get('/searchByName',controller.searchByName)

/*  Products Men Page */
router.get('/products-men',controller.getProductsMen)

/*  Products Women Page */
router.get('/products-women',controller.getProductsWomen)

/* GET Quick View product page. */
router.get('/quick_view-product/',controller.getQuickViewProduct)

/* POST Add to Cart page. */
router.post('/addToCart',authenticate.userAuth,controller.postAddToCart)

// GET Cart Page
router.get('/cart',authenticate.userAuth,controller.getCartPage)

/* POST Update Quantity page. */
router.post('/updateCart',authenticate.userAuth,controller.updateQuantity)

/* Delete a Product from Cart */
router.get('/deleteCartProduct/',authenticate.userAuth,controller.deleteCartProduct)

// GET Select Address Page
router.get('/selectAddress',authenticate.userAuth,controller.getSelectAddress)

// GET Add Address Page
router.get('/addAddress',authenticate.userAuth,controller.getAddAddress)

// POST Add Address
router.post('/add-address',authenticate.userAuth,controller.postAddAddress)

// GET Cart Checkout
router.get('/cart-checkOut',authenticate.userAuth,controller.getCartCheckOut)

// GET Confirmation Page
router.get('/order-confirm/',authenticate.userAuth,controller.getOrderConfirm)

// Coupon Validation
router.get('/coupon-validation',authenticate.userAuth,controller.couponValidation)

// Placing the order
router.post('/order-confirm',authenticate.userAuth,controller.postOrder)

// Payment Verification - Razorpay
router.post('/verify-payment',authenticate.userAuth,controller.verificationForPayment)

// GET User Page
router.get('/account',authenticate.userAuth,controller.userData)

// GET Orders Page
router.get('/orders',authenticate.userAuth,controller.orderHistory)

// GET Order details
router.get('/view-order/',authenticate.userAuth,controller.orderDetails)

// Cancel the Order
router.post('/cancel-order',authenticate.userAuth,controller.cancelOrder)

// GET My Address page
router.get('/addresses',authenticate.userAuth,controller.getAddresses)

// GET Add new Address page
router.get('/addNewAddress',authenticate.userAuth,controller.addNewAddress)

// POST Add new Address
router.post('/addNewAddress',authenticate.userAuth,controller.addNewAccountAddress)

// GET Edit Address page
router.get('/editAddress',authenticate.userAuth,controller.editAddress)

// POST Edit Address page
router.post('/editAddress',authenticate.userAuth,controller.editAddressPosting)

// Delete one Address
router.get('/deleteAddress',authenticate.userAuth,controller.deleteAnAddress)

module.exports = router;
