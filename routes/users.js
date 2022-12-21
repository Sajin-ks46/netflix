var express = require('express');
const con = require('../config/config');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('admin/adminLogin');
});
router.get('/adminHome',(req,res)=>{
if(req.session.admin){
res.render('admin/adminHome')
}
})
router.post('/adminLogin', function (req, res, next) {
  console.log(req.body)
  let mail = "admin@gmail.com";
  let pass = "admin";
  let adminData = {
      mail,
      pass
  }
  if (mail == req.body.email && pass == req.body.password) {
    console.log("login success")
    req.session.admin=adminData;
    res.redirect("/users/adminHome")
  } else {
    console.log("login error")
    res.redirect("/users")
  }
}
);
router.post('/addProduct', (req, res) => {
  console.log(req.body);
  console.log(req.files);
  if (!req.files) return res.status(400).send("no files where uploaded");
  var file = req.files.img;
  var uploaded_img = file.name;
  let sql = "insert into products set ?"
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif"){
    file.mv("public/images/products/" + file.name, function (err) {
      if (err) {
        res.send("error while uploading img")
      } else {
        var data = req.body;
        data.img = uploaded_img;
        con.query(sql, data, (err, result) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect("/users/adminHome")
          }
        })
      }
    })
}else{
  console.log("uploading error")
}
})
router.get('/orderd',(req,res)=>{
  var sql="select products.id,products.name,products.price,cart.id,cart.userid,cart.qty from products inner join cart on products.id =cart.products.id where  cart.status ='purchased'";
  let user= req.session.user;
  con.query(sql,(err,result)=>{
    if(err){
      console.log(err)

    }else{
      console.log("my order",result)
      res.render('admin/orderd',{result})
    }
  })
  res.render('admin/orderd')
})
module.exports = router;



