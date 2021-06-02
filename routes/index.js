var express = require('express');
var router = express.Router();
var fs = require('fs')
// 引入jwt token工具
const JwtUtil = require('../public/utils/jwt');

const UserModel = require("../db/index").UserModel
const DocModel = require("../db/index").DocModel
const TagsModel = require("../db/index").TagsModel
const ResourcesModel = require("../db/index").ResourcesModel

/* GET home page. */
// 登入
router.post('/api/login', function (req, res, next) {
  const { username, password } = req.body
  new Promise((resolve, reject) => {
    // 根据用户名查询用户
    UserModel.findOne({'username':username}).exec((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }).then((result) => {
    if (result) {
      var resPassword = result.password
      if (password == resPassword) {
        // 登陆成功，添加token验证
        let _id = result._id.toString();
        // 将用户id传入并生成token
        let jwt = new JwtUtil(_id);

        let token = jwt.generateToken();

        // 将 token 返回给客户端
        res.send({ status: 200, msg: '登陆成功', token: token, userid: result._id });
      } else {
        res.send({ status: 400, msg: '账号密码错误' });
      }
    } else {
      res.send({ status: 404, msg: '账号不存在' })
    }
  }).catch((err) => {
    res.send({ status: 500, msg: '账号密码错误' });
  })

});
//注册
router.post('/api/register', function (req, res, next) {
  const { username, password } = req.body
  UserModel.findOne({ username }, (err, user) => {
    if (user) {
      res.send({ code: 1, msg: '用户名已存在！' });
    } else {
      const user = {
        username,
        password
      }
      const userModer = new UserModel(user)
      userModer.save((err, user) => {
        console.log(user);
        if (!err) {
          res.send({ code: 0, msg: '注册成功' });
        }
      })
    }
  })
});
// 上传文档
router.post('/api/admin/docment/add', function (req, res, next) {
  const { title, content, tags, menuList, desc } = req.body
  const doc = {
    title, content, tags, menuList, desc,
    createTime: Date.now(),
    id: parseInt(Math.random() * 1000000)
  }
  const docModel = new DocModel(doc)
  docModel.save((err, doc) => {
    if (!err) {
      res.send({ code: 0, msg: '上传成功！' })
    } else {
      res.send({ code: 1, msg: '上传失败！请重试' })
    }
  })
})
// 根据id获取文档详情
router.get('/api/docment/detail', function (req, res, next) {
  const { id } = req.query
  DocModel.findOne({ id }, (err, docs) => {
    if (!err) {
      res.send({ code: 0, data: docs })
    } else {
      res.send({ code: 0, msg: "失败" })
    }
  })
})
// 根据id 删除文档
router.post("/api/admin/docment/delete", function (req, res, next) {
  const { id } = req.body
  console.log(id);
  DocModel.deleteOne({ id }, (err, doc) => {
    if (doc) {
      res.send({ code: 0, msg: '删除成功!' })
    } else {
      res.send({ code: 1, msg: '删除失败!' })
    }
  })
})
// 根据id 修改文档
router.post('/api/admin/docment/update', function (req, res, next) {
  const { id, doc } = req.body
  DocModel.updateOne({ id }, { ...doc }, function (err) {
    if (!err) {
      res.send({ code: 0, msg: '修改成功！' })
    } else {
      res.send({ code: 1, msg: "修改失败！" })
    }
  })
})
// 获取文档
router.get('/api/docment/all', function (req, res, next) {
  DocModel.find({}).sort({ "_id": -1 }).exec((err, docs) => {
    if (!err) {
      const newDocs = docs.map(item => {
        const { id, title, createTime, tags, desc } = item
        return { id, title, createTime, tags, desc }
      })
      console.log(docs.length);

      const result = {
        code: 0,
        total: docs.length,
        data: newDocs
      }
      res.send(result)
    } else {
      res.send({ code: 0, msg: "失败" })
    }
  })
})
// 添加tgs
router.post('/api/admin/add-tag', function (req, res, next) {
  const { name } = req.body
  TagsModel.findOne({ name }, (err, tag) => {
    if (tag) {
      res.send({ code: 1, msg: 'tag已存在!' })
    } else {
      const tag = {
        name,
        id: parseInt(Math.random() * 8)
      }
      const tagModel = new TagsModel(tag)
      tagModel.save((err, tag) => {
        if (!err) {
          res.send({ code: 0, msg: '添加成功！' })
        }
      })
    }
  })
})
// 搜索功能
router.get('/api/search', function (req, res, next) {
  const { keyword } = req.query
  const reg = new RegExp(keyword, 'i')
  DocModel.find({ "$or": [{ title: { $regex: reg } }, { tags: { $regex: reg } }] }, { _id: 0, menuList: 0, tags: 0, content: 0 }, (err, docs) => {
    if (!err) {
      res.send({ code: 0, result: docs })
    }
  })
})
// 根据tag 搜索文档
router.get('/api/search/tag', function (req, res, next) {
  const { keyword } = req.query
  const reg = new RegExp(keyword, 'i')
  DocModel.find({ tags: { $regex: reg } }, { _id: 0, menuList: 0, content: 0 }, (err, docs) => {
    if (!err) {
      res.send({ code: 0, result: { docs, total: docs.length } })
    }
  })
})
// 添加资源导航分类
router.post('/api/admin/resources/add_cate', function (req, res, next) {
  const { name } = req.body
  console.log(name);
  ResourcesModel.findOne({ name }, (err, resourcesCate) => {
    if (!resourcesCate) {
      const newResources = {
        name,
        children: []
      }
      const resModel = new ResourcesModel(newResources)

      resModel.save((err, resourcesCate) => {
        if (!err) {
          res.send({ code: 0, msg: '添加成功!' })
        }
      })
    } else {
      res.send({ code: 1, msg: '改分类已存在!' })
    }
  })
})
// 获取资源分类
router.get('/api/resources/cate', function (req, res, next) {
  ResourcesModel.find({}, (err, resources) => {
    if (!err) {
      res.send({ code: 0, data: resources })
    } else {
      res.send({ code: 1, msg: '获取失败' })
    }
  })
})
// 删除资源分类
router.post('/api/admin/resources/delete_cate', function (req, res, next) {
  const { name } = req.body
  ResourcesModel.deleteOne({ name }, (err) => {
    if (!err) {
      res.send({ code: 0, msg: '删除成功' })
    } else {
      res.send({ code: 1, msg: '删除失败!' })
    }
  })
})
// 根据分类添加资源
router.post("/api/admin/resources/add", function (req, res, next) {
  const { name, imageUrl, url, cate, desc } = req.body.resource

  ResourcesModel.findOne({ name: cate }, (err, resource) => {
    resource.children.push({
      name,
      imageUrl,
      url,
      desc,
      cate,
      id: cate + Date.now()
    })
    resource.save((err) => {
      if (!err) {
        res.send({ code: 0, msg: '添加成功！' })
      } else {
        res.send({ code: 1, msg: '添加失败!' })
      }
    })
  })
})
// 根据分类删除资源
router.post("/api/admin/resources/delete", function (req, res, next) {
  const { cate, id } = req.body

  ResourcesModel.findOne({ name: cate }, (err, resourceCate) => {
    const index = resourceCate.children.findIndex(item => item.id === id)
    if (index !== -1) {
      resourceCate.children.splice(index, 1)
      resourceCate.save((err) => {
        if (!err) {
          res.send({ code: 0, msg: '删除成功！' })
        } else {
          res.send({ code: 1, msg: '删除失败!' })
        }
      })
      return
    } else {
      res.send({ code: 1, msg: '删除失败!' })
    }
  })
})
// 根据分类更新资源
router.post("/api/admin/resources/update", function (req, res, next) {
  const { cate, id } = req.body.resource

  ResourcesModel.findOne({ name: cate }, (err, resourceCate) => {
    const index = resourceCate.children.findIndex(item => item.id === id)
    if (index !== -1) {
      const resource = resourceCate.children[index]
      const newResource = Object.assign(resource, req.body.resource)
      const newChildren = resourceCate.children
      newChildren[index] = newResource
      ResourcesModel.updateOne({ name: cate }, { children: newChildren }, (err, result) => {
        if (!err) {
          res.send({ code: 0, msg: '更新成功！' })
        } else {
          res.send({ code: 1, msg: '更新失败!' })
        }
      })
      return
    } else {
      res.send({ code: 1, msg: '更新失败!' })
    }
  })
})

module.exports = router;
