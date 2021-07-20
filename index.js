var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var mysql = require('mysql');

var jwt = require('njwt');

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));

var dbconect = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password: '',
    database: 'laundaymgmt',
    multipleStatements: true
});
dbconect.connect();

app.get('/users/:id',function(req,res){
    let id=req.params.id;
    if(!id)
    {
        return res.status(400).send({error:true,message:'Bad Request.'});
    }
    dbconect.query('select * from UserProfile where UserId=?',id,function(error,results,fields){
        if(error) throw error;
        return res.send({error:false,data:results[0],message:'Users retrieved successfully.'});
    });
});
app.get('/GetBags',function(req,res){
    let id=req.body.UserId;
    if(!id)
    {
        return res.status(400).send({error:true,message:'Bad Request.'});
    }
    dbconect.query("call LM_GET_BAGS(?,@output); select @output as output;",id,function(error,results,fields){
        
        if(error) console.log(error);

        //return res.send({error:false,data:results,message:'Bags info retrieved successfully.'});
        
        //if (!error && results[0].affectedrows != 0 && results[2][0].output==1)
        if (!error && results[2][0].output==1)
        {
            //console.log(results[2][0].output);
            return res.send({error:false,data:results[0],message:'Bags info retrieved successfully.'});
        }
    });
});

app.get('/ValidateUser',function(req,res){
    let username=req.body.UserName;
    let pwd = req.body.Password;
    if(!username && !pwd) return res.status(400).send({error:true,message:'Bad Request.'});
    dbconect.query("select * from UserProfile where UserName=? and PASSWORD=?",[username,pwd],function(error,results,fields){
        if(error) console.log(error);

        var claims = { iss: 'expresswebapi', sub: username }
        var token = jwt.create(claims, 'top-secret-phrase');
        token.setExpiration(new Date().getTime() + 60*1000);
        return res.send({error:false,data:token.compact(),message:'Valid User'});

    });
});



app.get('/',function(req,res){
    return res.send({error: true,message: 'Hello Govind Raj kumar sanu' })
});

app.listen(2800, function(){
    console.log('Node app is running on port 2050');
});
module.exports=app;