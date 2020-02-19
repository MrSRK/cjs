"use strict"
const ObjectId=require('mongoose').Types.ObjectId;
const defaultRoutes={
    pug:
    [
        'pug_list',
        'pug_show',
        'pug_signIn',
        'pug_sighUp',
        'pug_signOut',
        'pug_table',
        'pug_edit',
        'pug_new',
    ],
    api:
    [
        'json_find',
        'json_findById',
        'json_authentication',
        'json_auth_find',
        'json_auth_findById',
        'json_auth_save',
        'json_auth_findByIdAndUpdate',
        'json_auth_findByIdAndDelete'
    ]
}
const pug={}
defaultRoutes.pug.forEach(f=>
{
    pug[f]=(toolbox,model,schema,name,req,res)=>
    {
        return res.status(200).render(f,
        {
            title:name.substr(0,1).toUpperCase()+name.substr(1)+' '+f.substr(0,1).toUpperCase()+f.substr(1)+' Page'
        })
    }
})
const api={}
api.json_find=(toolbox,model,schema,name,req,res)=>
{
    const where=req.body.where||{}
    return model
    .find(where)
    .exec()
    .then(doc=>
    {
        return res.status(200).json({status:true,doc:doc})
    }).catch(error=>
    {
        throw error
    })
}
api.json_findById=(toolbox,model,schema,name,req,res)=>
{
    if(!ObjectId.isValid(req.params._id))
        return res.status(500).json({status:true,error:{name:"Error",message:'Invalid Object id'}})
    return model
    .findById(req.params._id)
    .exec()
    .then(doc=>
    {
        return res.status(200).json({status:true,doc:doc})
    })
    .catch(error=>
    {
        return res.status(500).json({status:true,error:error})
    })
}
api.json_authentication=(toolbox,model,schema,name,req,res)=>
{

}
api.json_auth_find=(toolbox,model,schema,name,req,res)=>
{

}
api.json_auth_findById=(toolbox,model,schema,name,req,res)=>
{

}
api.json_auth_save=(toolbox,model,schema,name,req,res)=>
{

}
api.json_auth_findByIdAndUpdate=(toolbox,model,schema,name,req,res)=>
{

}
api.json_auth_findByIdAndDelete=(toolbox,model,schema,name,req,res)=>
{

}
module.exports.pug=pug
module.exports.api=api