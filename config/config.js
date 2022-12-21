var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database:"ecommerce"
});

con.connect(function(err) {
  if (err){
    console.log(err)
  }else{
  console.log("Connected Successfully!");
  }
});

module.exports=con;