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
            'apiEdit'
        ]
    }
    defaultRoutes.pug.forEach(f=>
    {
        if(toolbox.controller.pug[f])
            route[f]=(req,res)=>
            {
                return toolbox.controller.pug[f](toolbox,model,req,res)
            }
    })
    return route
}
module.exports=controller