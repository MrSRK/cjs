"use strict"
const model=require('./model')
const controller=(toolbox,name)=>
{
    const route={}
    const defaultRoutes=[
        'list',
        'show',
        'signIn',
        'sighUp',

        'signOut',
        'table',
        'edit',
        'new',

        'Gfind',
        'GfindById',
        'GsignIn',
        'GsignUp',

        'AsignOut',
        'Afind',
        'AfindById'
    ]
    defaultRoutes.forEach(f=>
    {
        console.log(toolbox.controller[f])
        if(toolbox.controller[f])
            route[f]=(req,res)=>
            {
                return toolbox.controller[f](toolbox,model,req,res)
            }
    })
    return route
}
module.exports=controller