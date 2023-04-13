import * as orderApis from "./order";
import * as userApis from "./user";

module.exports = {
  ...orderApis,
  ...userApis,
}