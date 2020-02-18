const controller=(toolbox,name)=>
{
    home=(req,res)=>
    {
        //console.log(res)
        res.json({sss:'Eimai h Home Page...'})
    }
    return {home:home}
}
module.exports=controller