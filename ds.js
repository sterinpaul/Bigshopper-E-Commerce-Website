var rotate = function(nums, k) {
    
    if(k > 0){
        if(k > (nums.length)){
            k = k % (nums.length)
        }
        for(let i=0;i<k;i++){
            nums.unshift(nums.pop())
        }
    }
    return nums
};
console.log(rotate([1,2,3,4,5,6,7],540000))