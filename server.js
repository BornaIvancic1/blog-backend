const express=require('express');
require('dotenv').config();
const mongoose= require('mongoose');
const bodyParser= require('body-parser');
const userRoutes= require('./userRoutes');

const app = express();
const PORT=process.env.PORT;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/login',
                   {
                                      useNewUrlParser:true,
                                      useUinifieTopology:true
                   }
).then(()=>console.log('MongoDB connected')).
catch(err=>console.log(err));

app.use('/api/users', userRoutes);           

app.listen(PORT, ()=>
{console.log(`Server running on https/localhost:${PORT}`);
});