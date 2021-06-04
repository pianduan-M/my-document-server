const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/my_docment')

const conn = mongoose.connection

conn.on("connected", () => {
  console.log('数据库链接成功！');
})
// 用户名
const userSchema = mongoose.Schema({
  username: { type: String, require: true },
  password: { type: String, require: true }
})
const UserModel = mongoose.model('user', userSchema)
exports.UserModel = UserModel

// 文档
const docSchema = mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  tags: { type: Array },
  createTime: { type: String, require: true },
  id: { type: Number, require: true },
  menuList: { type: Array },
  desc: { type: String }
})
const DocModel = mongoose.model('doc', docSchema)
exports.DocModel = DocModel

// 标签
const tagsSchema = mongoose.Schema({
  name: { type: String, require: true },
  id: { type: Number, require: true },
  docs: { type: Array }
})
const TagsModel = mongoose.model('tags', tagsSchema)
exports.TagsModel = TagsModel

// 网站导航
const ResourcesSchema = mongoose.Schema({
  name: { type: String, require: true },
  children: { type: Array }
})
const ResourcesModel = mongoose.model('resources', ResourcesSchema)
exports.ResourcesModel = ResourcesModel
