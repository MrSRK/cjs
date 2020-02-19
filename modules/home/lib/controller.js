"use strict"
const model=require('./model')
const controller=(toolbox,name)=>
{
    const route={}
    const defaultRoutes={
        pug:
        [
            //'pug_list',
            //'pug_show',
            //'pug_signIn',
            //'pug_sighUp',
            //'pug_signOut',
            'pug_table',
            'pug_edit',
            'pug_new',
        ],
        api:
        [
            'json_find',
            'json_findById',
            //'json_authentication',
            'json_auth_find',
            'json_auth_save',
            'json_auth_findById',
            'json_auth_findByIdAndDelete'
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
    // Rewrite Default function for a custom home page
    route['list']=(req,res)=>
    {
        return res.status(200).render('home',
        {
            title:'Home Page'
        })
    }
    return route
}
module.exports=controller