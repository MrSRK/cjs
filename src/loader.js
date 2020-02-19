"use strict"
const chalk=require('chalk')
const path=require('path')
const fs=require('fs')
const express=require('express')
const modules=[]
const toolbox={}
const views=[path.join(__dirname,'../view')]
const controller=require('./core/controller')
const deploy=(app,config,next)=>
{
    try
    {
        toolbox.router=express.Router()
        toolbox.controller=controller
        let modulesPath=path.join(__dirname,config.modules.path||'../modules')
        if(!fs.existsSync(modulesPath))
            throw new Error('Modules directory not exists')
        fs.readdir(modulesPath,(error,directories)=>
        {
            if(error)
                throw error
            let len=directories.length
            directories.forEach((e)=>
            {
                fs.lstat(modulesPath+'/'+e,(error,stat)=>
                {
                    len--
                    if(error)
                        throw error
                    if(!stat.isDirectory())
                        return false
                    if(!fs.existsSync(modulesPath+'/'+e+'/index.js'))
                    {
                        console.error('%s Module %s %s not exist',chalk.red('[ERROR]'),chalk.blue(e),chalk.yellow('[index.js]'))
                        return next({name:"Error",message:'index.js not exist at module '+e})
                    }
                    let mod={
                        name:e,
                        path:modulesPath+'/'+e,
                        index:modulesPath+'/'+e+'/index.js'
                    }
                    views[views.length]=modulesPath+'/'+e+'/view'
                    load(app,mod)
                    if(len==0)
                        return next(null,toolbox.router,views)
                })
            })
        })
    }
    catch(error)
    {
        next(error)
    }
}
toolbox.route=(name,config,controller)=>
{
    if(config.router.routes)
        config.router.routes.forEach(r=>
        {
            console.log("| [%s] Attach router [%s] '%s' at controller's function %s",chalk.red(name),chalk.blue(r.method),chalk.grey(name+r.path),chalk.yellow(r['controller']+'()'))
            if(controller[r['controller']])
                toolbox.router[r.method]('/'+name+r.path,controller[r['controller']])
        })
    if(config.router.gustUserDefaultRoutes)
    {
        const guestRoutes={
            pug:
            [
                {
                    "method":"get",
                    "status":200,
                    "path":"/",
                    "controller":"list"
                },
                {
                    "method":"get",
                    "status":200,
                    "path":"/show/:_id",
                    "controller":"show"
                }
            ],
            api:
            [
                {
                    "method":"get",
                    "status":200,
                    "path":"/list",
                    "controller":"apiList"
                },
                {
                    "method":"get",
                    "status":200,
                    "path":"/show/:_id",
                    "controller":"apiShow"
                }
            ]
        }
        guestRoutes.pug.forEach(r=>
        {
            console.log("| [%s] Attach router [%s] '%s' at controller's function %s",chalk.red(name),chalk.blue(r.method),chalk.grey('/'+name+r.path),chalk.yellow(r['controller']+'()'))
            if(controller[r['controller']])
                toolbox.router[r.method]('/'+name+r.path,controller[r['controller']])
        })
        guestRoutes.api.forEach(r=>
        {
            console.log("| [%s] Attach router [%s] '%s' at controller's function %s",chalk.red(name),chalk.blue(r.method),chalk.grey('/api/'+name+r.path),chalk.yellow(r['controller']+'()'))
            if(controller[r['controller']])
                toolbox.router[r.method]('/api/'+name+r.path,controller[r['controller']])
        })
    }
    if(config.router.userRoutes)
    {
        const userRouts={
            pug:
            [
                {
                    "method":"get",
                    "status":200,
                    "path":"/signIn",
                    "controller":"signIn"
                },
                {
                    "method":"get",
                    "status":200,
                    "path":"/signUp",
                    "controller":"signUp"
                },
                {
                    "method":"get",
                    "status":200,
                    "path":"/signOut",
                    "controller":"signOut"
                },
            ],
            api:
            [
                {
                    "method":"post",
                    "status":200,
                    "path":"/signIn",
                    "controller":"apiSignIn"
                },
                {
                    "method":"put",
                    "status":200,
                    "path":"/signUp",
                    "controller":"apiSignUp"
                },
                {
                    "method":"post",
                    "status":200,
                    "path":"/signOut",
                    "controller":"apiSignOut"
                },
            ]
        }
        let powerRoot=''
        if(config.router.powerUser)
            powerRoot='/'+config.router.powerUser
        let us=[]
        if(config.router.powerUser)
        {
            us.pug=userRouts.pug.concat([
                {
                    "method":"get",
                    "status":200,
                    "path":"/",
                    "controller":"table"
                },
                {
                    "method":"get",
                    "status":200,
                    "path":"/edit/:_id",
                    "controller":"edit"
                },
                {
                    "method":"get",
                    "status":200,
                    "path":"/new",
                    "controller":"new"
                },
            ])
            us.api=userRouts.api.concat([
                {
                    "method":"get",
                    "status":200,
                    "path":"/table",
                    "controller":"apiTable"
                },
                {
                    "method":"put",
                    "status":200,
                    "path":"/new/",
                    "controller":"apiNew"
                },
                {
                    "method":"patch",
                    "status":200,
                    "path":"/edit/:_id",
                    "controller":"apiEdit"
                },
                {
                    "method":"delete",
                    "status":200,
                    "path":"/delete/:_id",
                    "controller":"apiDelete"
                },
            ])
        }
        else
            us=userRouts
        us.pug.forEach(r=>
        {
            console.log("| [%s] Attach router [%s] '%s' at controller's function %s",chalk.red(name),chalk.blue(r.method),chalk.grey(powerRoot+'/'+name+r.path),chalk.yellow(r['controller']+'()'))
            if(controller[r['controller']])
                toolbox.router[r.method](powerRoot+'/'+name+r.path,controller[r['controller']])
        })
        us.api.forEach(r=>
        {
            console.log("| [%s] Attach router [%s] '%s' at controller's function %s",chalk.red(name),chalk.blue(r.method),chalk.grey(powerRoot+'/api/'+name+r.path),chalk.yellow(r['controller']+'()'))
            if(controller[r['controller']])
                toolbox.router[r.method](powerRoot+'/api/'+name+r.path,controller[r['controller']])
        })
    }
    return true
}
const load=(app,mod)=>
{
    return modules[modules.length]=require(mod.index)(toolbox,mod.name)
}
module.exports.deploy=deploy