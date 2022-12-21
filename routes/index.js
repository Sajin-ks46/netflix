var express = require('express');
var router = express.Router();
var con = require("../config/config");
const{checkuser}=require('../middleware/checkuser');
/* GET home page. */
let razorpay = require("../razorpay/payment")

router.get('/', function (req, res, next) {
  let sql = "select * from products"
  con.query(sql, (err, products) => {
    if (err) {
      console.log(err)
    } else {
      if (req.session.user) {
        var user = req.session.user;
        var userId = req.session.user.id;
        var sql3 = " select count(*) as cartdata from cart where userId = ?"
        con.query(sql3, [userId], (err, rows) => {
          console.log(rows)
          let cart = rows[0].cartdata;
          user.cart = cart;
          res.render('user/users', { user, products });
        })
      } else {
        console.log(products)
        res.render('user/users', { products });
      }

    }
  });

});
router.get('/mycart', function (req, res, next) {
  var user = req.session.user;
  let userid=user.id;
  var sql= "select products.price,products.id,products.name,products.description,products.img,cart.qty from products inner join cart on products.id=cart.productid where cart.userid = ?" 
  con.query(sql,[userid],(err,result)=>{
    if(err){
      console.log(err)
    }else{
     console.log(result)
     let products=result;
     var total= 0;
     products.forEach(object => {
      console.log(object.price)
    total=object.price*object.qty+total;
     })
     console.log("total:",total)
     let GST=(total*18)/100;
     let subtotal= total + GST;
     user.total=total;
     user.GST=GST;
     user.subtotal=subtotal;
     res.render("user/cart",{user,products})
    }
  })
  
});
router.get('/reg', function (req, res, next) {
  res.render('user/userRegisteration');
});
router.get('/login', function (req, res, next) {
  res.render('user/userLogin');
});
router.post('/regdata', function (req, res, next) {
  console.log(req.body.email)
  let userMail = req.body.email;
  let sql = "select * from users where email=?"
  con.query(sql, [userMail], (err, row) => {
    if (err) {
      console.log(err)
    }
    else {
      if (row.length > 0) {
        console.log("email exist")
      }
      else {
        let data = req.body;
        let q = "insert into users set ?";
        con.query(q, data, function (err, result) {
          if (err) {
            console.log(err)
          } else {
            console.log("data inserted")
            res.redirect('/login')
          }
        })
      }
    }
  })

});
router.post('/logindata', function (req, res, next) {
  console.log(req.body)
  let email = req.body.email;
  let password = req.body.password;
  var sql = " select * from users where email=? and password=?"
  con.query(sql, [email, password], (err, row) => {
    if (err) {
      console.log(err)
    }
    else {
      if (row.length > 0) {
        console.log("login successful")
        req.session.user = row[0];
        res.redirect('/')
      } else {
        console.log("login failed")
      }
    }
  })
});
router.get('/mylogin', function (req, res, next) {
  res.render('admin/adminLogin'); 
});
router.get('/myhome', function (req, res, next) {
  res.render('admin/adminHome');
});


router.get("/addtocart/:id",checkuser, (req, res) => {
  console.log(req.params.id);
  let productId = req.params.id;
  userId = req.session.user.id;
  let sql1 = "select * from cart where userId = ? and productId = ?";
  con.query(sql1, [userId, productId], (err, row) => {
    if (err) {
      console.log(err)
    } else {
      if (row.length > 0) {
        let q = row[0].qty;
        let cartId = row[0].id;
        q = q + 1;
        let sql2 = "update cart set qty = ? where id = ?"
        con.query(sql2, [q, cartId], (err, resultss) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect("/")
          }
        })
      } else {
        let data = {
          productId,
          userId
        }
        let sql = "insert into cart set ?"
        con.query(sql, data, (err, result) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect("/")
          }
        })
        console.log("add to cart working")
      }
    }
  })
});
router.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect('/')
})
router.get('/addqty/:id',(req,res)=>{
var id = req.params.id;
var userid = req.session.user.id;
var sql ="select * from cart where userid =? and productid =?"
con.query(sql,[userid,id],(err,row)=>{
if(err){
console.log(err)
}else{
var Fqty = row[0].qty;
var newqty = Fqty + 1;
var sql2 = "update cart set qty = ? where productid = ? and userid = ?"
con.query(sql2,[newqty,id,userid],(err,result)=>{
if(err){
comsole.log(err)
}else{
  res.redirect('/mycart')
}
})
}
})
})

router.get('/subqty/:id',(req,res)=>{
  var id = req.params.id;
  var userid = req.session.user.id;
  var sql ="select * from cart where userid =? and productid =?"
  con.query(sql,[userid,id],(err,row)=>{
  if(err){
  console.log(err)
  }else{
  var Fqty = row[0].qty;
  var newqty = Fqty - 1;
  var sql2 = "update cart set qty = ? where productid = ? and userid = ?"
  con.query(sql2,[newqty,id,userid],(err,result)=>{
  if(err){
  comsole.log(err)
  }else{
    res.redirect('/mycart')
  }
  })
  }
  })
  })

  router.get('/remove/:id',(req,res)=>{
    var id = req.params.id;
  console.log(id)
  let userid=req.session.user.id;
  sql= "DELETE FROM cart where productid=? and userid=?"
con.query(sql,[id,userid],(err,result)=>{
  if(err){
    console.log(err)
}
  else{
    res.redirect("/mycart")
  }
})
})
router.get("/createrorder/:amount",(req,res)=>{
  console.log (req.params.amount)
  let amount=parseInt(req.params.amount);
  console.log( typeof(amount))
  let user=req.session.user;
  var options={
    amount:amount * 100,
    currency:"INR",
    receipt:"order_rcptid_11"
  };
  razorpay.orders.create(options, function(err, order) {
    console.log(err);
    console.log(order);
    res.render('user/checkout',{order,user})
  });
})
router.post('/verify',async(req,res)=>{
  console.log(req.body);
  console.log("verify")
let data = req.body;
  var crypto = require('crypto')
  var order_id =data['response[razorpay_order_id]']
  var payment_id =data['response[razorpay_payment_id]']
  const razorpay_signature=data['response[razorpay_signature]']
  const key_secret="2WRH4p5ngXPANhYSCrrP1rxK";
  let hmac=crypto.createHmac('sha256',key_secret);
  await hmac.update(order_id + "|" + payment_id);
  const generated_signatue = hmac.digest('hex');
  console.log(razorpay_signature,generated_signatue)
  if(razorpay_signature === generated_signatue){
   console.log("verified transaction")
   let sql="update cart set status = 'purchased' where userid = ?"
   let userid=req.session.user.id;
   con.query(sql,[userid],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      res.redirect('/myorders')
    }
   })
  }
      else{
        console.log("payment error..")
  }
}
)
router.get('/myorders',(req,res)=>{
  var sql= "select products.price,products.id,products.name,products.description,products.img,cart.qty from products inner join cart on products.id=cart.productid where cart.userid = ? and cart.status ='purchased' " 
  let userid=req.session.user.id;
  let user = req.session.user;
  con.query(sql,[userid],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      let orderedProducts = result
      console.log(orderedProducts)
      res.render("user/myorders",{user,orderedProducts})
    }
  })
})


module.exports = router;
