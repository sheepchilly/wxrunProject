const express = require('express');
const app = express();

app.get('/api/test',async (req,res)=>{
    res.send('后台');
})

app.listen(3000,()=>{
    console.log('正在监听中...');
})