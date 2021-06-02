const UserModel = require("./index").UserModel

function test() {
  UserModel.findOne({ username: 'admin' }).exec((err, res) => {
    console.log(err, res);
  })
}

test()