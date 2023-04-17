// merge 2 sorted arrays
var mergeTwoLists = function(list1, list2) {
    let newArr = []
    while(list1.length || list2.length){
        if(list1[0] <= list2[0]){
            newArr.push(list1.shift())
        }else{
            newArr.push(list2.shift())
        }
    }
    return newArr;
};
let a = [1,2,4]
let b = [1,3,4]

console.log(mergeTwoLists(a,b))
