
// Cart Quantity decrement
function decreaseCount(proId){

    let quantity = document.getElementById('quantity-'+proId).value
    
    if(quantity !=1){
        quantity = parseInt(quantity)-1
        $.ajax({
            url:'/updateCart',
            type:'POST',
            data:{
                id:proId,
                qty:quantity
            },
            success:(response)=>{
              if(response.status){
                document.getElementById('plus-'+proId).classList.add('btn-num-product-up','hov-btn3','flex-c-m')
                document.getElementById('plusBtn-'+proId).classList.add('fs-16','zmdi','zmdi-plus')
                document.getElementById('warn-'+proId).innerText = '';
                document.getElementById('qty-'+proId).innerText = quantity+' x';
                document.getElementById('total-'+proId).innerText = Math.round(quantity * document.getElementById('price-'+proId).innerText * 100)/100
                document.getElementById('cartTotal').innerText = response.sum
              }
            }
        })
    }
}


// Cart Quantity increment
function increaseCount(proId){

    let quantity = document.getElementById('quantity-'+proId).value
    quantity = parseInt(quantity)+1
    $.ajax({
        url:'/updateCart',
        type:'POST',
        data:{
            id:proId,
            qty:quantity
        }
    }).done((response) =>{
      if(response.status){
        document.getElementById('warn-'+proId).innerText = '';
        document.getElementById('qty-'+proId).innerText = quantity+' x';
        document.getElementById('total-'+proId).innerText = Math.round(quantity * document.getElementById('price-'+proId).innerText * 100)/100
        document.getElementById('cartTotal').innerText = response.sum
      }else{
        document.getElementById('quantity-'+proId).value = quantity-1;
        document.getElementById('plus-'+proId).classList.remove('btn-num-product-up','hov-btn3','flex-c-m','fs-16','zmdi','zmdi-plus')
        document.getElementById('plusBtn-'+proId).classList.remove('fs-16','zmdi','zmdi-plus')
        document.getElementById('warn-'+proId).innerText = `${response.stock} item in stock`;
      }
    }).fail((err) =>{ 
    })
}


// Remove a product from cart

function removeProduct(proId){

  swal({
    title: "Are you sure?",
    text: "Do you want to remove this item from cart ?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((willDelete) => {
    if (willDelete) {
      $.ajax({
          url:'/deleteCartProduct/',
          type:'GET',
          data:{
              id:proId
          },
          success:(response)=>{
              
              if(response.count === 0){
                  document.getElementById('cartIcon').innerText = '';
                  document.getElementById('cartIconM').innerText = '';
                  document.getElementById('cartHeading').innerText = 'Your cart is Empty';
                  document.getElementById('cartHeading').style.display = 'block';
                  document.getElementById('cartHeading').style.textAlign = 'center';
                  document.getElementById('totalContainer').style.display = 'none';
              }else{
                  document.getElementById('cartIcon').innerText = response.count
                  document.getElementById('cartIconM').innerText = response.count
                  document.getElementById('cartTotal').innerText = response.total
              }
              document.getElementById('prod-'+proId).style.display = 'none';
              
          }
      })
      swal("Item has been removed!", {
        icon: "success",
      });
    }
  });

}

function cancelOrder(id){
    let orderStatus = document.getElementById('orderCancellation').innerText
    if(orderStatus == 'Cancel'){
      orderStatus = 'Cancelled'
    }else{
      orderStatus = 'Refund Pending'
    }
    
    $.ajax({
      url:'/cancel-order?id='+id,
      type:'POST',
      data:$('#cancellationForm').serialize()+'&orderStatus='+orderStatus,
      success:(response)=>{
        if(response.status){
          $(document).ready(function(){
            $('#orderContainer').load(window.location.href + ' #orderContainer' );
          })
        }
      }
    })
}


// Change Order status by Admin
function changeOrderStatus(id,ordStatus=0){
  if(ordStatus != 0){
    let orderStatus = 'Cancelled'
    
    $.ajax({
      url:'/admin/changeOrderStatus?id='+id,
      type:'POST',
      data:$('#cancellationForm').serialize()+'&orderStatus='+orderStatus,
        success:function(response){
          if(response.status){
            document.getElementById('statusContainer').style.display = 'none'

            $(document).ready(function(){
              $('#status-reason').load(window.location.href + ' #status-reason' );
            })
          }
        }
      }
    )
  }else{
    let orderStatus = document.getElementById('changeOrderStatus').options[document.getElementById('changeOrderStatus').selectedIndex].text
    let status = document.getElementById('orderStatus').innerText
    
    if(orderStatus == 'Cancelled'){
      $('#exampleModal').modal('show');
    }else{
      if(orderStatus !== 'Change status' && orderStatus !== status){
        $.ajax({
          url:'/admin/changeOrderStatus?id='+id,
          type:'POST',
          data:{
              orderStatus:orderStatus
            },
            success:function(){
              if(orderStatus == 'Cancelled' || orderStatus == 'Refunded' || orderStatus == 'Delivered'){
                document.getElementById('statusContainer').style.display = 'none'
              }if(orderStatus == 'Delivered'){
                document.getElementById('statusRefunded').style.display = 'block'
                document.getElementById('statusProcessing').style.display = 'none'
                document.getElementById('statusConfirmed').style.display = 'none'
                document.getElementById('statusShipped').style.display = 'none'
                document.getElementById('statusDelivered').style.display = 'none'
                document.getElementById('statusCancelled').style.display = 'none'
              }else{
                document.getElementById('statusRefunded').style.display = 'none'
              }
              document.getElementById('orderStatus').innerText = orderStatus
            }
          }
        )
      }
    }
  }
}



// Adding Category and Sub-category
function addCategory(){
    let category = document.getElementById('category').value
    if(category != ''){
      $.ajax({
        url:'/admin/add-category',
        type:'POST',
        data:{
          category:category
        },
        success:function(categoryExists){
          if(categoryExists){
            document.getElementById('category-success').style.display = 'none'
            document.getElementById('category-alert').style.display = 'block'
          }else{
            
            $(document).ready(function(){
              setTimeout(function(){
                $('#categoryFieldChange').load(window.location.href + ' #categoryFieldChange' );
              },0)
            })
            
            document.getElementById('category-success').style.display = 'block'
            document.getElementById('category-alert').style.display = 'none'

          }
        }
      })
    }else{
      document.getElementById('category-success').style.display = 'none'
      document.getElementById('category-alert').style.display = 'none'
    }
}

function addSubCategory(){
  let subCategory = document.getElementById('subCategory').value
  if(subCategory != ''){
    let categoryId = document.getElementById('categoryForSub').options[document.getElementById('categoryForSub').selectedIndex].value
    let categoryName = document.getElementById('categoryForSub').options[document.getElementById('categoryForSub').selectedIndex].text
    
    $.ajax({
      url:'/admin/add-subCategory',
      type:'POST',
      data:{
        categoryId:categoryId,
        category:categoryName,
        subCategory:subCategory
      },
      success:function(response){
        if(response.subCategory){
          document.getElementById('sub-category-alert').style.display = 'block'
          document.getElementById('sub-category-success').style.display = 'none'
        }else{
            $(document).ready(function(){
              $('#category-table').load(window.location.href + ' #category-table' );
            })

          document.getElementById('sub-category-success').style.display = 'block'
          document.getElementById('sub-category-alert').style.display = 'none'
          document.getElementById('category-alert').style.display = 'none'
          document.getElementById('category-success').style.display = 'none'
        }
      }
    })
  }else{
    document.getElementById('sub-category-alert').style.display = 'none'
    document.getElementById('sub-category-success').style.display = 'none'
  }
}


