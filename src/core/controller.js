"use strict"
const defaultRoutes={
    pug:
    [
        'list',
        'show',
        'signIn',
        'sighUp',
        'signOut',
        'table',
        'edit',
        'new',
    ],
    api:
    [
        'apiList',
        'apiShow',
        'apiSignIn',
        'apiSignUp',
        'apiSignOut',
        'apiTable',
        'apiNew',
        'apiEdit',
        'apiDelete'
    ]
}
const pug={}
defaultRoutes.pug.forEach(f=>
{
    pug[f]=(toolbox,model,name,req,res)=>
    {
        return res.status(200).render(f,
        {
            title:name.substr(0,1).toUpperCase()+name.substr(1)+' '+f.substr(0,1).toUpperCase()+f.substr(1)+' Page'
        })
    }
})
const api={}
api.apiList=(toolbox,model,name,req,res)=>
{

}
api.apiShow=(toolbox,model,name,req,res)=>
{

}
api.apiSignIn=(toolbox,model,name,req,res)=>
{

}
api.apiSignUp=(toolbox,model,name,req,res)=>
{

}
api.apiSignOut=(toolbox,model,name,req,res)=>
{

}
api.apiTable=(toolbox,model,name,req,res)=>
{

}
api.apiNew=(toolbox,model,name,req,res)=>
{

}
api.apiEdit=(toolbox,model,name,req,res)=>
{

}
api.apiDelete=(toolbox,model,name,req,res)=>
{

}
module.exports.pug=pug
module.exports.api=api