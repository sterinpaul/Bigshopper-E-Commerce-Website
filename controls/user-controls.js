const { ObjectId } = require('mongodb');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

var userLog = true;

module.exports = {
    getIndex:(req,res)=>{
        if(req.session.user){
            var userName = req.session.user.fName;
            let cartCount = req.session.user.cart.length
            res.render('user/index',{title: 'BigShopper',userLog,userName,cartCount})
        }else{
            res.render('user/index',{title: 'BigShopper',userLog})
        }
    },
    getSignin:(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }else{
            res.render('user/signin',{title: 'BigShopper',userLog,blocked:req.session.blocked,invalidUser:req.session.invalid,unAuthorized:req.session.unAuthorized})
            req.session.blocked = false;
            req.session.invalid = false;
            req.session.unAuthorized = false
            userLog = true;
        }
    },
    getOtpSignin:(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }else{
            res.render('user/signInOtp',{title: 'BigShopper',userLog,blocked:req.session.blocked,invalidUser:req.session.invalid,unAuthorized:req.session.unAuthorized})
            req.session.blocked = false;
            req.session.invalid = false;
            req.session.unAuthorized = false;
            userLog = true;
        }
    },
    postOtpSignin:(req,res)=>{
        userHelpers.sendOtp(req.body.mobile).then((response)=>{
            if(response.status){
                req.session.user = response.user;
                res.redirect('/')
            }else if(response.blockedStatus){
                req.session.blocked = true;
                res.redirect('/signInOtp')
            }else if(response.invalidStatus){
                req.session.invalid = true;
                res.redirect('/signInOtp')
            }
        })
    },
    getSignup:(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }else{
            res.render('user/signup',{title: 'BigShopper',userLog,userExist:req.session.userExist})
            req.session.userExist = false;
        }
    },
    postSignup:(req,res)=>{
        userHelpers.doSignup(req.body).then((response)=>{
            req.session.user = response
            userLog = true;
            res.redirect('/')
        }).catch((err)=>{
            console.log(err);
            req.session.userExist = true;
            res.redirect('/signup')
        })
    },
    postSignin:(req,res)=>{
        userHelpers.dologin(req.body).then((response)=>{
            if(response.status){
                req.session.user = response.user
                res.redirect('/')
            }else if(response.blockedStatus){
                req.session.blocked = true;
                res.redirect('/signin')
            }else if(response.invalidStatus){
                req.session.invalid = true;
                res.redirect('/signin')
            }else{
                req.session.unAuthorized = true;
                res.redirect('/signin')
            }
        })
    },
    signOut:(req,res)=>{
        req.session.user = null;
        userLog = false;
        res.redirect('/signin')
    },
    getProducts:(req,res)=>{
        let category = req.query.category
        let skip = req.query.skip
        
        productHelpers.getAllProducts(category,skip).then((response)=>{
            
            let products = response[0]
            let qty = response[1]
            
            if(category === undefined){
                if(req.session.user){
                    userName = req.session.user.fName;
                    cartCount = req.session.user.cart.length
            
                    res.render('user/products',{title: 'BigShopper',userLog,userName,products,itemAddedToCart:req.session.itemAdded,cartCount,qty})
                }else{
                    res.render('user/products',{title: 'BigShopper',userLog,products,qty})
                }
            }else{
                res.json([products,qty])
            }
        })
    },
    searchByName:(req,res)=>{
        productHelpers.searchKeyByName(req.query.category,req.query.keyWord).then((response)=>{
            res.json(response)
        })
    },
    getProductsMen:(req,res)=>{
        productHelpers.getAllProductsMen().then((products)=>{
            userName = req.session.user.fName;
            res.render('user/products-men',{title: 'BigShopper',userLog,products,userName})
        })
    },
    getProductsWomen:(req,res)=>{
        productHelpers.getAllProductsWomen().then((products)=>{
            userName = req.session.user.fName;
            res.render('user/products-women',{title: 'BigShopper',userLog,products,userName})
        })
    },
    getQuickViewProduct:async(req,res)=>{
  
        let product = await productHelpers.getProductDetails(req.query.id)
        if(req.session.user){
            userName = req.session.user.fName;
            cartCount = req.session.user.cart.length
            res.render('user/quick_view-product',{ title: 'BigShopper',userLog,userName,product,cartCount})
        }else{
            res.render('user/quick_view-product',{ title: 'BigShopper',userLog,product})
        }
    },
    getCartPage:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        productHelpers.getCart(req.session.user._id).then((user)=>{
            res.render('user/cart',{title: 'BigShopper',userLog,userName,user,cartCount})
        })
    },
    postAddToCart:async(req,res)=>{
        req.body.qty = parseInt(req.body.qty)
        await productHelpers.addToCart(req.session.user._id,req.query.id,req.body.qty).then((response)=>{
            if(response.cartCount){
                req.session.user.cart.length = response.cartCount
            }
            res.json({status:true})
        })
    },
    updateQuantity:async(req,res)=>{
        let quantity = parseInt(req.body.qty)
        productHelpers.updateCart(req.session.user._id,req.body.id,quantity).then(async ()=>{
            let total = await productHelpers.getCart(req.session.user._id)
            res.json(total.sum)
        })
    },
    deleteCartProduct:(req,res)=>{
        productHelpers.deleteProduct(req.session.user._id,req.query.id).then(async (response)=>{
            let total = await productHelpers.getCart(req.session.user._id)
            req.session.user.cart.length = response.cartCount
            res.json({count:response.cartCount,total:total.sum})
        })
    },
    getSelectAddress:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.getAddress(req.session.user._id).then((addresses)=>{
            res.render('user/selectAddress',{title: 'BigShopper',userLog,userName,addresses,cartCount})
        })
    },
    getAddAddress:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        res.render('user/addAddress',{ title: 'BigShopper',userLog,userName,cartCount})
    },
    postAddAddress:(req,res)=>{
        req.body.id = new ObjectId();
        userHelpers.addAddress(req.session.user._id,req.body).then(()=>{
            res.redirect('/selectAddress')
        })
    },
    getCartCheckOut:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        res.render('user/cart-checkOut',{ title: 'BigShopper',userLog,userName,cartCount})
    },
    getOrderConfirm:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        // let sum = userHelpers.getCartTotal(req.session.user._id)
        userHelpers.getUserDetails(req.session.user._id).then((response)=>{
            if(response.cart[0]){
                res.render('user/cart-confirm',{ title: 'BigShopper',userLog,userName,response,cartCount})
            }else{
                res.redirect('/cart')
            }
        })
    },
    postOrder:async(req,res)=>{
        req.body.orderId = ObjectId()
        req.body.subTotal = parseInt(req.body.subTotal)
        req.body.discount = parseInt(req.body.discount)
        req.body.total = parseInt(req.body.total)
        
        if(req.body.paymentOption == 'COD'){
            await userHelpers.orderCreation(req.session.user._id,req.body).then(async(response)=>{
                req.session.user.cart.length = null
                cartCount = req.session.user.cart.length
                response.COD_status = true
                res.json(response)
            })
        }else if(req.body.paymentOption == 'RazorPay'){
            await userHelpers.getRazorpay(req.body).then((response)=>{
                response.RAZORPAY_status = true
                res.json(response)
            })
        }
    },
    verificationForPayment:(req,res)=>{
        try{
            userHelpers.verifyPayment(req.session.user._id,req.body).then(async (response)=>{
                if(response.status){
                    req.session.user.cart.length = null
                    cartCount = req.session.user.cart.length

                    let orderData = {
                        orderId:ObjectId(req.body["payment[receipt]"]),
                        total:parseInt(req.body["payment[amount]"])/100,
                        addressId:req.body["payment[address]"],
                        paymentOption:'RazorPay'
                    }
                    await userHelpers.orderCreation(req.session.user._id,orderData)
                }
                res.status(200).json(response)
            })
        }catch(error){
            res.status(404).json(response)
        }
    },
    userData:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.getUserDetails(req.session.user._id).then((user)=>{
            let wallet = user.wallet
            res.render('user/account',{title:'BigShopper',userLog,userName,cartCount,wallet})
        })
    },
    orderHistory:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.orderSummary(req.session.user._id).then((orders)=>{
            res.render('user/order-history',{title:'BigShopper',userLog,userName,orders,cartCount})
        })
    },
    orderDetails:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.orderDetails(req.query.id).then((order)=>{
            res.render('user/view-order',{title:'BigShopper',userLog,userName,order,cartCount})
        })
    },
    cancelOrder:(req,res)=>{
        userHelpers.changeOrderStatus(req.query.id,req.body).then(()=>{
            res.json({status:true})
        })
    },
    getAddresses:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.getAddress(req.session.user._id).then((addresses)=>{
            res.render('user/myAddresses',{title: 'BigShopper',userLog,userName,addresses,cartCount})
        })
    },
    addNewAddress:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        if(req.query.order == 'cart'){
            orderPageStatus = 'cart';
        }else{
            orderPageStatus = 'address';
        }
        res.render('user/addAccountAddress',{title: 'BigShopper',userLog,userName,cartCount,orderPageStatus})
    },
    addNewAccountAddress:(req,res)=>{
        req.body.id = new ObjectId();
        userHelpers.addAddress(req.session.user._id,req.body).then(()=>{
            if(req.query.order == 'cart'){
                res.redirect('/order-confirm?id='+req.session.user._id)
            }else{
                res.redirect('/addresses')
            }
        })
    },
    editAddress:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        if(req.query.order == 'cart'){
            orderPageStatus = 'cart';
        }else{
            orderPageStatus = 'address';
        }
        
        userHelpers.getCartAndAddressConfirm(req.session.user._id,req.query.id).then((response)=>{
            res.render('user/editAccountAddress',{title:'BigShopper',userLog,userName,response,cartCount,orderPageStatus})
        })
    },
    editAddressPosting:(req,res)=>{
        userHelpers.updateAccountAddress(req.session.user._id,req.query.id,req.body).then(()=>{
            
            if(req.query.order == 'cart'){
                res.redirect('/order-confirm?id='+req.session.user._id)
            }else{
                res.redirect('/addresses')
            }
            orderPageStatus = null;
        })
    },
    deleteAnAddress:(req,res)=>{
        userHelpers.deleteAccountAddress(req.session.user._id,req.query.id).then(()=>{
            res.redirect('/addresses')
        })
    },
    couponValidation:async(req,res)=>{
        req.query.subTotal = Number(req.query.subTotal)
        let couponCount = await userHelpers.checkCouponExistance(req.session.user._id,req.query.couponCode)
        
        if(couponCount == '1'){
            res.json({used:true})
        }else{
            userHelpers.checkCouponValidity(req.query).then((response)=>{
                res.json(response)
            })
        }
    }
}