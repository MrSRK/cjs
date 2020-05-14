const express=require('express')

try
{
    const app=new express()
    
    app.all('*',(req,res)=>
    {
        res.status(200).json({status:true,message:"Express Working"})
    })
    app.listen(80)
    console.log('Test 2')
}
catch(error)
{
    console.log('Error')
    console.log(error)
}