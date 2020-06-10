let express=require('express');
let cors=require('cors'); 
let bodyParser=require('body-parser'); 
let sha1=require('sha1');
const path = require('path');
let mongoose=require('mongoose');
let app=express();
app.use(cors());
app.use(bodyParser.json())  ;
mongoose.connect("mongodb+srv://mongodbuser:mongodb@cluster0-dktnn.mongodb.net/<dbname>?retryWrites=true&w=majority",{ useUnifiedTopology: true , useNewUrlParser: true });
let signupModel=require('./db/signup');
let promodel=require('./db/product')
app.use(express.static('uploads'));
const multer=require('multer');
const PATH = './uploads';
const PORT=process.env.PORT || 3333;
let disDir=__dirname + "/dist/projest";
app.use(express.static(disDir));
if(process.env.NODE_ENV === 'production'){
    //set static folder
    app.use(express.static(disDir));
}
app.get('*',(req, res,next) => {
    res.sendFile(path.join(__dirname, 'dist', 'projest','index.html'));
});
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    cb(null,  Date.now()+'-'+file.originalname)
  }
});
let upload = multer({
  storage: storage
}).single('Image');

// signup by form value
app.post('/api/signupbyform',(req,res)=>
{
    console.log(req.body)
    upload(req,res,(err)=>
    {
        if(err){
            res.json({'msg':'Uploading error'})
        }
        else
        {
            let name=req.body.name;
            let email=req.body.email;
            let password=sha1(req.body.password);
            let fname=req.file.filename;
            let ins=new signupModel({'name':name,'email':email,'password':password,'image':fname});
            ins.save(err=>
             {
                 if(err)
                 {
                   res.json({'msg':'Error Occured'})
                  }
                 else
                 {
                  res.json({'err':0,'msg':'Data Saved','name':name,'email':email})
                 }
             })
        }
    })
})
app.post("/api/loginbyform",(req,res)=>{
  let name =req.body.name;
  let email=req.body.email;
  let password=sha1(req.body.password);
   console.log(req.body)
  signupModel.find({'name':name,'email':email,'password':password},(err,data)=>
  {
      if (err) {}
      else if(data.length==0)
      {
          res.json({'err':1,'msg':'err has occured'})
          console.log(err)
      }
      else
      {
          res.json({'err':0,'msg':'Login Success','name':name,'email':email});
      }
  })
})
app.post('/api/addproduct',(req,res)=>
{
  upload(req,res,(err)=>
    {
        if(err){
            res.json({'msg':'Uploading error'})
        }
        else
        {
            let email=req.body.email;
            let product=req.body.product;
            let college=req.body.college;
            let branch=req.body.branch;
            let year=req.body.year;
            let contact=req.body.contact;
            let fname=req.file.filename;
            let ins=new promodel({'email':email,'product':product,'college':college,'branch':branch,'year':year,'contact':contact,'image':fname});
            ins.save(err=>
             {
                 if(err)
                 {
                   res.json({'msg':'Error Occured'})
                  }
                 else
                 {
                  res.json({'err':0,'msg':'Data Saved'})
                 }
             })
        }
    })
})
// app.post('api/loginsocially',(req,res)=>
// {
//     let email=req.body.email;
//     let name=req.body.name;
//     let ins=new signupModel({'email':email,'name':name});
//     ins.save(err=>
//         {
//             if(err)
//             {
//               res.json({'msg':'Error Occured'})
//              }
//             else
//             {
//              res.json({'err':0,'msg':'Data Saved','name':name,'email':email})
//             }
//         })
// })
app.post('/api/searchproducts/',(req,res)=>
{
    let searchpro=req.body.searchpro;
    promodel.find({'product':searchpro},(err,data)=>
    {
        if(err){}
        else{
            res.json({'err':0,'pdata':data})
        }
    })
})

app.get('/api/getproducts/:uid',(req,res)=>      
{
    let uid=req.params.uid;
    promodel.find({'email':uid},(err,data)=>
    {
        if(err){res.json({'err':1,'msg':'erroroccured'})}
        else{
            res.json({'err':0,'pdata':data})
        }
    })
})

app.get('/api/deleteproduct/:pid',(req,res)=>
{
    let pid=req.params.pid;
    promodel.deleteOne({_id:pid},(err)=>
    {
        if(err){}
        else 
        {
            res.json({'err':0,'msg':'product Deleted'});
        }
    })
})

app.get('/api/homeproduct',(req,res)=>      
{
    promodel.find({},(err,data)=>
    {
        if(err){res.json({'err':1,'msg':'erroroccured'})}
        else{
            res.json({'err':0,'pdata':data})
        }
    })
})

app.listen(PORT,()=>
{
    console.log("Works on 2222");
})