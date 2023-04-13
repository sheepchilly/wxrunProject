import {
    request
} from "../common/request";

// 查询所有订单
export function getAllOrderApi(data) {
    return request('/order/getAllOrder', "GET", data)
}

export function saveErrandOrder(params){
  return request('/order/saveErrandOrder',"POST",params)
}