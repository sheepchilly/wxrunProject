import {request} from "../common/request";

// 查询所有订单
export function loginApi(params) {
    return request('/carpool-user/wx/login', "POST", params)
}