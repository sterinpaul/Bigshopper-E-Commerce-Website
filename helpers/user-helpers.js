var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const moment = require('moment');
var objectId = require('mongodb').ObjectId
var Razorpay = require('razorpay')
var crypto = require('crypto')


module.exports = {
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({$or:[{email:userData.email},{mobile:userData.mobile}]})
            if(user){
                let err = new Error('User already Exists')
                reject(err)
            }else{
                userData.password = await bcrypt.hash(userData.password,10)
                userData.cart = [];
                userData.access = true;
                userData.wallet = 0;
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(()=>{
                    // db.get().collection(collection.USER_COLLECTION).updateOne(userData,{$set:{access:true,cart:[]}})
                    resolve(userData)
                })
            }
        })
    },
    dologin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})

            if(user){
                if(user.access){
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                      
                        if(status){
                            console.log("Login Success");
                            response.user = user
                            response.status = true
                            resolve(response)
                        }else{
                            console.log("Invalid credentials");
                            response.invalidStatus = true
                            resolve(response)
                        }
                    })
                }else{
                    console.log("User Blocked");
                    response.blockedStatus = true
                    resolve(response)
                }
                
            }else{
                console.log("Login failed");
                resolve({status:false})
            }
        })
    },
    sendOtp:(number)=>{
        return new Promise(async(resolve,reject)=>{
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({mobile:number})
            
            if(user){
                if(user.access){
                    console.log("Sign in success");
                    response.user = user
                    response.status = true
                    resolve(response)
                }else{
                    console.log("User Blocked");
                    response.blockedStatus = true
                    resolve(response)
                }
            }else{
                console.log("Invalid User");
                response.invalidStatus = true
                resolve(response)
            }
        })
    },
    getAllUsers:()=>{
        return new Promise (async(resolve,reject)=>{
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    getUserDetails:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((user)=>{
                resolve(user)
            })
        })
    },
    updateUser:(userId,userDetails)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    fName:userDetails.fName,
                    lName:userDetails.lName,
                    gender:userDetails.gender,
                    mobile:userDetails.mobile
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    blockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{access:false}}).then((response)=>{
                resolve(response)
            })
        })
    },
    unBlockUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{access:true}}).then((response)=>{
                resolve(response)
            })
        })
    },
    checkingProductExist:(userId,proId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId),'cart._id':objectId(proId)}).then((response)=>{
                if(response == null){
                    response = true
                }else{
                    response = false
                }
                resolve(response)
            })
        })
    },
    getAddress:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    addAddress:(userId,address)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$addToSet:{address:address}}).then((response)=>{
                resolve(response)
            })
        })
    },
    getCartAndAddressConfirm:(userId,addressId=0)=>{
        return new Promise(async(resolve,reject)=>{

            let address = await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId),'address.id':objectId(addressId)}).project({_id:0,'address.$':1}).next()
            
            await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((response)=>{
                response.address = address.address
                resolve(response)
            })   
        })
    },
    getWallet:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.WALLET_COLLECTION).findOne({userId:objectId(userId)}).then((wallet)=>{
                if(wallet){
                    for(let i=wallet.transactions.length-1;i>=0;i--){
                        wallet.transactions[i].date = moment(wallet.transactions[i].date).format('ll')
                    }
                }
                resolve(wallet)
            })
        })
    },
    checkCartProducts:(productData,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart  = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})
            cart = cart.cart
            for(let i=0;i<productData.length;i++){
                for(let j=0;j<cart.length;j++){
                    if(String(productData[i]._id) == String(cart[j]._id)){
                        productData[i].noCart = true
                    }
                }
            }
            resolve(productData)
        })
    },
    getCartTotal:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let sum = await db.get().collection(collection.USER_COLLECTION).aggregate([
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
            sum = sum[0].total
            sum = Math.round(sum*100)/100
            resolve(sum)
        })
    },
    orderCreation:(userId,cartDetails)=>{
        return new Promise(async(resolve,reject)=>{
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)})

            const cart = user.cart
            const username = user.fName + " " + user.lName
            
            let address = await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userId),'address.id':objectId(cartDetails.addressId)}).project({_id:0,'address.$':1}).next()
            address = address.address[0]
            
            await db.get().collection(collection.ORDER_COLLECTION).insertOne({_id:(cartDetails.orderId),userId:objectId(userId),userName:username,products:cart,subTotal:(cartDetails.subTotal),couponCode:(cartDetails.couponCode),discount:(cartDetails.discount),total:(cartDetails.total),address:address,dated: new Date(),modeOfPayment:(cartDetails.paymentOption),orderStatus:"Processing"}).then(async (response)=>{
                
                // Add Coupon code to user collection
                if(cartDetails.couponCode !== ''){
                    await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$addToSet:{usedCoupons:(cartDetails.couponCode)}})
                }

                if(cartDetails.payableAmount != ''){
                    await db.get().collection(collection.WALLET_COLLECTION).updateOne(
                        {userId:objectId(userId)},
                        {
                            $push:{transactions:{id:new objectId(),type:'Debit',amount:(cartDetails.total - cartDetails.payableAmount),date:new Date()}},
                            $inc:{balance:-(cartDetails.total - cartDetails.payableAmount)}
                        },
                        {upsert:true}
                    )
                }else if(cartDetails.paymentOption == 'Wallet'){
                    await db.get().collection(collection.WALLET_COLLECTION).updateOne(
                        {userId:objectId(userId)},
                        {
                            $push:{transactions:{id:new objectId(),type:'Debit',amount:(cartDetails.total),date:new Date()}},
                            $inc:{balance:-(cartDetails.total)}
                        },
                        {upsert:true}
                    )
                }
                

                // Updating product sale count & Quantity
                // let items = cart.map(product=>{return {_id:product._id , quantity:product.quantity}})
                for(let i=0;i<cart.length;i++){
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:(cart[i]._id)},{$inc:{quantity:-(cart[i].quantity),count:(cart[i].quantity)}})
                }

                // Emptying cart
                await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$set:{cart:[]}})
                resolve(response)
            })
        })
    },
    getRazorpay: (response) => {
        try {
          return new Promise((resolve) => {
            const razorpay = new Razorpay({
              // eslint-disable-next-line no-undef
              key_id: process.env.RAZORPAY_KEY_ID,
              // eslint-disable-next-line no-undef
              key_secret: process.env.RAZORPAY_KEY_SECRET,
            })
            if(response.payableAmount == null){
                response.payableAmount = response.total
            }
            const options = {
              amount: response.payableAmount * 100,
              currency: "INR",
              receipt: "" + response.orderId,
              payment_capture: 1,
            }
            razorpay.orders.create(options, function (err, order) {
              if (err) {
                console.log(err)
              } else {
                order.address = response.addressId
                order.total = response.total
                order.subTotal = response.subTotal
                order.discount = response.discount
                order.couponCode = response.couponCode
                resolve(order)
              }
            })
          })
        } catch (error) {
          console.log(error)
          throw new Error("Failed to get razorpay")
        }
    },
    verifyPayment:(user,paymentInfo) => {
        try {
          return new Promise((resolve, reject) => {
            let hmac = crypto.createHmac("sha256", "6PZjf8ZGzaZLWf0rDR3i2rOF")
            hmac.update(
              paymentInfo["order[razorpay_order_id]"] +
                "|" +
                paymentInfo["order[razorpay_payment_id]"]
            )
            
            hmac = hmac.digest("hex")

            if (hmac === paymentInfo["order[razorpay_signature]"]) {

                resolve({ status: true ,userId: user, orderId: paymentInfo["payment[receipt]"]})
            } else {
                reject({ status: false ,userId: user, orderId: paymentInfo["payment[receipt]"]})
            }
          })
        } catch (error) {
          console.log(error)
          throw new Error("Failed to verify razorpay payment")
        }
    },
    orderSummary:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).sort({dated:-1}).toArray().then((response)=>{
                for(let i=0;i<response.length;i++){
                    response[i].dated = moment(response[i].dated).format('Do MMM YYYY')
                }
                resolve(response)
            })
        })
    },
    orderDetails:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)}).then((response)=>{
                response.dated = moment(response.dated).format('Do MMM YYYY')
                resolve(response)
            })
        })
    },
    changeOrderStatus:(orderId,status)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{orderStatus:status.orderStatus,cancellationReason:status.reason}},{upsert:true}).then(async()=>{

                if(status.orderStatus == 'Cancelled' || status.orderStatus == 'Refunded'){
                    let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
                    if(order.modeOfPayment == 'RazorPay' || status.orderStatus == 'Refunded'){
                        // await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(order.userId)},{$inc:{balance:(order.total)}})
                        await db.get().collection(collection.WALLET_COLLECTION).updateOne(
                            {userId:objectId(order.userId)},{
                                $push:{transactions:{id:new objectId(),type:'Credit',amount:(order.total),date:new Date()}},
                                $inc:{balance:(order.total)}
                            },
                            {upsert:true}
                        )
                    }
                    let products = order.products
                    let itemsArray = products.map((product)=>{return {_id:product._id , quantity:product.quantity}})
                    for(let i=0;i<products.length;i++){
                        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:(itemsArray[i]._id)},{$inc:{quantity:(itemsArray[i].quantity),count:-(itemsArray[i].quantity)}})
                    }
                }
                resolve()
            })
        })
    },
    updateAccountAddress:(userId,addressId,body)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId),'address.id':objectId(addressId)},{
                $set:{
                    'address.$.name':body.name,
                    'address.$.houseName':body.houseName,
                    'address.$.street':body.street,
                    'address.$.town':body.town,
                    'address.$.district':body.district,
                    'address.$.state':body.state,
                    'address.$.pinCode':body.pinCode,
                    'address.$.mobileNo':body.mobileNo
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    deleteAccountAddress:(userId,addressId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{$pull:{address:{id:objectId(addressId)}}})
            resolve()
        })
    },
    checkCouponExistance:(userId,couponCode)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.USER_COLLECTION).countDocuments({_id:objectId(userId),usedCoupons:{$in:[couponCode]}}).then((count)=>{
                resolve(count)
            })
        })
    },
    checkCouponValidity:(coupon)=>{
        return new Promise(async(resolve,reject)=>{
            let couponData = await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:(coupon.couponCode),listed:true})
            
            const status = {}
            if(couponData){
                let now = new Date()
                if(now < couponData.couponStartDate){
                    status.inactive = true
                }else if(now > couponData.couponExpiryDate){
                    status.expired = true
                }else if(coupon.subTotal < couponData.minOrder){
                    status.minimum = couponData.minOrder
                }else{
                    let discount = Math.round(coupon.subTotal * couponData.discountPercent / 100)
                    if(discount > couponData.maxDiscount){
                        discount = couponData.maxDiscount
                    }
                    status.discount = discount
                    status.total = coupon.subTotal - discount
                }
            }else{
                status.error = true
            }
            resolve(status)
        })
    }
}