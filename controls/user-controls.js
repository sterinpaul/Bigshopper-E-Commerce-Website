const { ObjectId } = require('mongodb');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')

var userLog = true;

module.exports = {
    /* Get Index page */
    getIndex:(req,res)=>{
        if(req.session.user){
            var userName = req.session.user.fName;
            let cartCount = req.session.user.cart.length
            res.render('user/index',{title: 'BigShopper',userLog,userName,cartCount,hPage:true})
        }else{
            res.render('user/index',{title: 'BigShopper',userLog,hPage:true})
        }
    },
    /* Get Sign-in page */
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
    /* Get OTP Sign-in page */
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
    // User Sign in with OTP
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
    /* Get Sign-up page */
    getSignup:(req,res)=>{
        if(req.session.user){
            res.redirect('/')
        }else{
            res.render('user/signup',{title: 'BigShopper',userLog,userExist:req.session.userExist})
            req.session.userExist = false;
        }
    },
    /* POST Sign-up page */
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
    /* POST User Sign-in page */
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
    /* Sign-out from User Page */
    signOut:(req,res)=>{
        req.session.user = null;
        userLog = false;
        res.redirect('/signin')
    },
    /*  view Products Page */
    getProducts:(req,res)=>{
        let category = req.query.category
        let skip = req.query.skip
        
        productHelpers.getAllProducts(category,skip).then(async(response)=>{
            let categoryData = await productHelpers.getAllCategories()
            categoryData = categoryData.category
            
            let products = response[0]
            let qty = response[1]
            
            if(category === undefined){
                if(req.session.user){
                    userName = req.session.user.fName;
                    cartCount = req.session.user.cart.length
                    await userHelpers.checkCartProducts(products,req.session.user._id).then((products)=>{
                        res.render('user/products',{title: 'BigShopper',userLog,userName,products,itemAddedToCart:req.session.itemAdded,categoryData,cartCount,qty,proPage:true})
                    })
                }else{
                    res.render('user/products',{title: 'BigShopper',userLog,products,categoryData,qty,proPage:true})
                }
            }else{
                if(req.session.user){
                    await userHelpers.checkCartProducts(products,req.session.user._id).then((products)=>{
                        res.json([products,qty,(req.session.user.fName)])
                    })
                }else{
                    res.json([products,qty])
                }
            }
        })
    },
    // Search products by Name
    searchByName:(req,res)=>{
        productHelpers.searchKeyByName(req.query.category,req.query.keyWord).then((response)=>{
            res.json(response)
        })
    },
    /*  Products Men Page */
    getProductsMen:(req,res)=>{
        productHelpers.getAllProductsMen().then((products)=>{
            userName = req.session.user.fName;
            res.render('user/products-men',{title: 'BigShopper',userLog,products,userName})
        })
    },
    /*  Products Women Page */
    getProductsWomen:(req,res)=>{
        productHelpers.getAllProductsWomen().then((products)=>{
            userName = req.session.user.fName;
            res.render('user/products-women',{title: 'BigShopper',userLog,products,userName})
        })
    },
    /* GET Quick View product page. */
    getQuickViewProduct:async(req,res)=>{
  
        let product = await productHelpers.getProductDetails(req.query.id)
        if(req.session.user){
            userName = req.session.user.fName;
            cartCount = req.session.user.cart.length
            let proNoExist = await userHelpers.checkingProductExist(req.session.user._id,req.query.id)
            res.render('user/quick_view-product',{ title: 'BigShopper',userLog,userName,product,cartCount,proPage:true,proNoExist})
        }else{
            res.render('user/quick_view-product',{ title: 'BigShopper',userLog,product,proPage:true,proNoExist:true})
        }
    },
    /* GET Add to Cart page. */
    getCartPage:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        productHelpers.getCart(req.session.user._id).then((user)=>{
            res.render('user/cart',{title: 'BigShopper',userLog,userName,user,cartCount,cartPage:true})
        })
    },
    /* POST Add to Cart page. */
    postAddToCart:async(req,res)=>{
        if(req.session.user){
            req.body.qty = parseInt(req.body.qty)
            let stock = await productHelpers.stockChecking(req.query.id)
            let cartQty = 0
            if(req.session.user.cart.length){
                cartQty = await productHelpers.cartChecking(req.session.user._id,req.query.id)
            }
            if(stock < (req.body.qty + cartQty)){
                res.json({status:false,qty:stock})
            }else{
                await productHelpers.addToCart(req.session.user._id,req.query.id,req.body.qty).then((response)=>{
                    if(response.cartCount){
                        req.session.user.cart.length = response.cartCount
                    }
                    res.json({status:true})
                })
            }
        }else{
            res.json({noLogin:true})
        }
    },
    /* POST Update Quantity in cart */
    updateQuantity:async(req,res)=>{
        let quantity = parseInt(req.body.qty)
        let stock = await productHelpers.stockChecking(req.body.id)
        if(stock < req.body.qty){
            res.json({status:false,stock:stock})
        }else{
            productHelpers.updateCart(req.session.user._id,req.body.id,quantity).then(async ()=>{
                let total = await productHelpers.getCart(req.session.user._id)
                res.json({status:true,sum:total.sum})
            })
        }
    },
    /* Delete a Product from Cart */
    deleteCartProduct:(req,res)=>{
        productHelpers.deleteProduct(req.session.user._id,req.query.id).then(async (response)=>{
            let total = await productHelpers.getCart(req.session.user._id)
            req.session.user.cart.length = response.cartCount
            res.json({count:response.cartCount,total:total.sum})
        })
    },
    // GET Select Address Page
    getSelectAddress:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.getAddress(req.session.user._id).then((addresses)=>{
            res.render('user/selectAddress',{title: 'BigShopper',userLog,userName,addresses,cartCount})
        })
    },
    // GET Add Address Page
    getAddAddress:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        res.render('user/addAddress',{ title: 'BigShopper',userLog,userName,cartCount})
    },
    // POST Add Address
    postAddAddress:(req,res)=>{
        req.body.id = new ObjectId();
        userHelpers.addAddress(req.session.user._id,req.body).then(()=>{
            res.redirect('/selectAddress')
        })
    },
    // GET Cart Checkout page
    getCartCheckOut:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        res.render('user/cart-checkOut',{ title: 'BigShopper',userLog,userName,cartCount})
    },
    // GET Order Confirmation Page
    getOrderConfirm:async(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        let wallet = await userHelpers.getWallet(req.session.user._id)
        let walletAmount = 0
        if(wallet){
            walletAmount = wallet.balance
        }
        // let sum = userHelpers.getCartTotal(req.session.user._id)
        await userHelpers.getUserDetails(req.session.user._id).then((response)=>{
            if(response.cart[0]){
                res.render('user/cart-confirm',{ title: 'BigShopper',userLog,userName,response,cartCount,walletAmount})
            }else{
                res.redirect('/cart')
            }
        })
    },
    // Placing the order
    postOrder:async(req,res)=>{
        let noStock = await productHelpers.cartStockChecking(req.session.user._id)
        if(noStock.length){
            let message = ''
            for(let i=0;i<noStock.length;i++){
                message += noStock[i].name +' : Available qty. '+ noStock[i].qty+' , '
            }
            res.json({message:message})
        }else{
            req.body.orderId = ObjectId()
            req.body.subTotal = parseInt(req.body.subTotal)
            req.body.discount = parseInt(req.body.discount)
            req.body.total = parseInt(req.body.total)
            if(req.body.payableAmount !=''){
                req.body.payableAmount = parseInt(req.body.payableAmount)
                if(req.body.paymentOption == 'COD'){
                    req.body.paymentOption = 'COD & Wallet'
                }else{
                    req.body.paymentOption = 'RazorPay & Wallet'
                }
                console.log('req.body after',req.body);
            }
            if(req.body.paymentOption == null){
                req.body.paymentOption = 'Wallet'
            }
            console.log('req.body after if null',req.body);
            
            if(req.body.paymentOption == 'COD' || req.body.paymentOption == 'COD & Wallet' || req.body.paymentOption == 'Wallet'){
                await userHelpers.orderCreation(req.session.user._id,req.body).then(async(response)=>{
                    req.session.user.cart.length = null
                    cartCount = req.session.user.cart.length
                    response.COD_wallet_status = true
                    res.json(response)
                })
            }else if(req.body.paymentOption == 'RazorPay' || req.body.paymentOption == 'RazorPay & Wallet'){
                await userHelpers.getRazorpay(req.body).then((response)=>{
                    response.RAZORPAY_status = true
                    res.json(response)
                })
            }
        }
    },
    // Payment Verification of Razorpay
    verificationForPayment:(req,res)=>{
        console.log('req-verificationForPayment',req.body);
        try{
            userHelpers.verifyPayment(req.session.user._id,req.body).then(async (response)=>{
                console.log('response-verifyPayment',response);
                if(response.status){
                    req.session.user.cart.length = null
                    cartCount = req.session.user.cart.length

                    let orderData = {
                        orderId:ObjectId(req.body["payment[receipt]"]),
                        total:parseInt(req.body["payment[total]"]),
                        subTotal: parseInt(req.body["payment[subTotal]"]),
                        couponCode: req.body["payment[couponCode]"],
                        discount: parseInt(req.body["payment[discount]"]),
                        addressId: req.body["payment[address]"],
                        paymentOption:'RazorPay'
                    }
                    console.log('orderData',orderData);
                    await userHelpers.orderCreation(req.session.user._id,orderData)
                }
                res.status(200).json(response)
            })
        }catch(error){
            res.status(404).json(response)
        }
    },
    // GET User Page
    userData:async(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.getWallet(req.session.user._id).then(wallet=>{
            res.render('user/account',{title:'BigShopper',userLog,userName,cartCount,wallet})
        })
    },
    // GET Order history Page
    orderHistory:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.orderSummary(req.session.user._id).then((orders)=>{
            res.render('user/order-history',{title:'BigShopper',userLog,userName,orders,cartCount})
        })
    },
    // GET Order details page
    orderDetails:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.orderDetails(req.query.id).then((order)=>{
            res.render('user/view-order',{title:'BigShopper',userLog,userName,order,cartCount})
        })
    },
    // Cancel the Order
    cancelOrder:(req,res)=>{
        userHelpers.changeOrderStatus(req.query.id,req.body).then(()=>{
            res.json({status:false})
        })
    },
    // GET My Address page
    getAddresses:(req,res)=>{
        userName = req.session.user.fName;
        cartCount = req.session.user.cart.length
        userHelpers.getAddress(req.session.user._id).then((addresses)=>{
            res.render('user/myAddresses',{title: 'BigShopper',userLog,userName,addresses,cartCount})
        })
    },
    // GET Add new Address page
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
    // POST Add new Address
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
    // GET Edit Address page
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
    // POST Edit Address page
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
    // Delete one Address
    deleteAnAddress:(req,res)=>{
        userHelpers.deleteAccountAddress(req.session.user._id,req.query.id).then(()=>{
            res.json({status:true})
        })
    },
    // Coupon Validation in order confirm page
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