var db = require('../config/connection')
var collection = require('../config/collection')
var objectId = require('mongodb').ObjectId
const moment = require('moment');

module.exports = {
  getAllProducts:(category=0,skipNo=0)=>{
    return new Promise (async(resolve,reject)=>{

      if(category == 'All Products' || category == 0){

        let proQty = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments()
        if(skipNo == '0'){
          let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(8).sort({_id:-1}).toArray()
          resolve([products,proQty])
        }else{
          let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(8).skip(skipNo*8).sort({_id:-1}).toArray()
          resolve([products,proQty])
        }

      }else if(category == 'Top Selling'){
        let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({count:-1}).limit(4).toArray()
        resolve([products,proQty=8])
      }else{

        let proQty = await db.get().collection(collection.PRODUCT_COLLECTION).countDocuments({category:category})  

        if(skipNo == '0'){
          let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category}).limit(8).sort({_id:-1}).toArray()
          resolve([products,proQty])
        }else{
          let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({category:category}).limit(8).skip(skipNo*8).sort({_id:-1}).toArray()
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
  adminOrdersList:()=>{
    return new Promise(async(resolve,reject)=>{
      let orders = await db.get().collection(collection.ORDER_COLLECTION).find().sort({dated:-1}).toArray()
      for(let i=0;i<orders.length;i++){
        orders[i].dated = moment(orders[i].dated).format('Do MMM YYYY')
      }
      resolve(orders)
    })
  },
  selectCategoryDetails:(categoryName)=>{
      return new Promise(async(resolve,reject)=>{
          let subCategories = await db.get().collection(collection.CATEGORY_SUB_COLLECTION).find({category:categoryName,listed:true},{_id:0,subCategory:1}).toArray()
          subCategories = subCategories.map(category=>category.subCategory)
          resolve(subCategories)
      })
  },
  salesReport:(searchCriterias)=>{
      return new Promise(async(resolve,reject)=>{
          let startDate,endDate,orders;
          if(searchCriterias.fromDate){
              startDate = new Date(searchCriterias.fromDate)
              endDate = new Date(moment.utc(searchCriterias.toDate).endOf('day').format())
              if(searchCriterias.modeOfPayment == 'Show all'){
                  orders = await db.get().collection(collection.ORDER_COLLECTION).find({orderStatus:'Delivered',dated:{$gte:startDate,$lte:endDate}}).sort({dated:-1}).toArray()
              }else{
                  orders = await db.get().collection(collection.ORDER_COLLECTION).find({orderStatus:'Delivered',modeOfPayment:(searchCriterias.modeOfPayment),dated:{$gte:startDate,$lte:endDate}}).sort({dated:-1}).toArray()
              }
          }else{
              orders = await db.get().collection(collection.ORDER_COLLECTION).find({orderStatus:'Delivered'}).sort({dated:-1}).toArray()
          }
          for(let i=0;i<orders.length;i++){
            orders[i].dated = moment(orders[i].dated).format('Do MMM YYYY')
          }
          resolve(orders)
      })
  },
  getTotalOrders:()=>{
      return new Promise(async(resolve,reject)=>{
          response = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
              $match: {
                orderStatus: "Delivered",
              },
            },
            {
              $group: {
                _id: {
                  month: {
                    $month: "$dated",
                  },
                },
                total: {
                  $sum: "$total",
                },
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $group: {
                _id: null,
                months: {
                  $sum: 1,
                },
                count: {
                  $sum:"$count"
                },
                total: {
                  $sum: "$total",
                },
              },
            }
          ]).next()
          resolve(response)
      })
  },
  getMonthlySales:()=>{
    return new Promise(async(resolve,reject)=>{
      const today = new Date()
      const todayNumber = parseInt(moment().format('D'))
      today.setDate(today.getDate() - todayNumber)
      let lastDayOfLastMonth = moment(today).format('YYYY-MM-DD')
      today.setFullYear(today.getFullYear()-1)
      today.setDate(today.getDate() + 1)
      let previousYearDate = moment(today).format('YYYY-MM-DD')
      
      let monthlySales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
          $match: {
            dated: {
              $gte: new Date(previousYearDate),
              $lte: new Date(lastDayOfLastMonth)
            },
            orderStatus:"Delivered"
          }
        },
        {
          $sort: {
            dated: 1,
          }
        },
        {
          $group: {
            _id: {
              monthSort: {
                $month: "$dated",
              },
              year: {
                $year: "$dated",
              },
            },
            totalSales: {
              $sum: "$total",
            },
          },
        },
        {
          $sort: {
            "_id.monthSort": 1,
          },
        },
        {
          $project: {
            totalSales: 1,
            year: "$_id.year",
            _id: 0,
            months: {
              $arrayElemAt: [
                [
                  "",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                "$_id.monthSort"
              ]
            }
          }
        },
        {
          $sort: {
            year: 1
          }
        },
        {
          $project: {
            month: {
              $concat: [
                "$months",
                "-",
                {
                  $toString: "$year",
                },
              ],
            },
            totalSales: 1,
          }
        }
      ]).toArray()
      resolve(monthlySales)
    })
  },
  getCategorywiseData:()=>{
      return new Promise(async(resolve,reject)=>{
          let categoryData = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
              {
                $group: {
                  _id: "$category",
                  count: {
                    $sum: "$count",
                  },
                  totalNum: {
                    $sum: 1,
                  },
                },
              },
              {
                $project: {
                  category: "$_id",
                  count: 1,
                  totalNum: 1,
                  _id: 0,
                },
              },
            ]).toArray()
          resolve(categoryData)
      })
  },
  getCouponsPage:()=>{
    return new Promise(async(resolve,reject)=>{
    const coupons = await db.get().collection(collection.COUPON_COLLECTION).find().sort({couponExpiryDate:-1}).toArray()
    for(let i=0;i<coupons.length;i++){
      coupons[i].couponStartDate = moment(coupons[i].couponStartDate).format('Do MMM YYYY')
      coupons[i].couponExpiryDate = moment(coupons[i].couponExpiryDate.setDate(coupons[i].couponExpiryDate.getDate() - 1)).format('Do MMM YYYY')
    }
      resolve(coupons)
    })
  },
  checkCouponExistance:(couponCode)=>{
    return new Promise(async(resolve,reject)=>{
      await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:couponCode}).then((couponData)=>{
        resolve(couponData)
      })
    })
  },
  addingCoupon:(couponData)=>{
    return new Promise(async(resolve,reject)=>{
      let today = new Date();
      today = moment.utc(today).startOf('day').format()
      if(couponData.couponStartDate == ''){
        couponData.couponStartDate = new Date(today)
      }else{
        couponData.couponStartDate = new Date(moment.utc(couponData.couponStartDate).startOf('day').format())
      }
      couponData.couponExpiryDate = new Date(moment.utc(couponData.couponExpiryDate).endOf('day').format())
      
      couponData.minOrder = parseInt(couponData.minOrder)
      couponData.discountPercent = Number(couponData.discountPercent)
      couponData.maxDiscount = parseInt(couponData.maxDiscount)
      couponData.status = 'VALID'
      couponData.listed = true
      await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then(()=>{
        resolve()
      })
    })
  },
  getCouponEdit:(couponId)=>{
    return new Promise(async(resolve,reject)=>{
      await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:objectId(couponId)}).then((couponData)=>{
        couponData.couponStartDate = moment(couponData.couponStartDate).format('YYYY-MM-DD')
        couponData.couponExpiryDate = moment(couponData.couponExpiryDate.setDate(couponData.couponExpiryDate.getDate() - 1)).format('YYYY-MM-DD')
        resolve(couponData)
      })
    })
  },
  postCouponEdit:(couponId,couponData)=>{
    return new Promise(async(resolve,reject)=>{
      let today = new Date();
      today = moment.utc(today).startOf('day').format()
      if(couponData.couponStartDate == ''){
        couponData.couponStartDate = new Date(today)
      }else{
        couponData.couponStartDate = new Date(moment.utc(couponData.couponStartDate).startOf('day').format())
      }
      couponData.couponExpiryDate = new Date(moment.utc(couponData.couponExpiryDate).endOf('day').format())
      
      couponData.minOrder = parseInt(couponData.minOrder)
      couponData.discountPercent = Number(couponData.discountPercent)
      couponData.maxDiscount = parseInt(couponData.maxDiscount)
      await db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(couponId)},{$set:{
        couponStartDate:couponData.couponStartDate,
        couponExpiryDate:couponData.couponExpiryDate,
        minOrder:couponData.minOrder,
        discountPercent:couponData.discountPercent,
        maxDiscount:couponData.maxDiscount,
        couponDescription:couponData.couponDescription
      }}
      )
      .then(()=>{
        resolve()
      })
    })
  },
  couponListUnlist:(couponData)=>{
    return new Promise(async(resolve,reject)=>{
      if(couponData.listed == 'true'){
        couponData.listed = true
      }else{
        couponData.listed = false
      }
      await db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(couponData.id)},{$set:{listed:couponData.listed}}).then(()=>{
        resolve()
      })
    })
  }
}