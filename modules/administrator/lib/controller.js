"use strict"
const model=require('./model')
const controller=(toolbox,name)=>
{
    const route={}
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
    defaultRoutes.pug.forEach(f=>
    {
        route[f]=(req,res)=>
        {
            return toolbox.controller.pug[f](toolbox,model,name,req,res)
        }
    })
    defaultRoutes.api.forEach(f=>
    {
        route[f]=(req,res)=>
        {
            return toolbox.controller.api[f](toolbox,model,name,req,res)
        }
    })
    return route
}
module.exports=controller