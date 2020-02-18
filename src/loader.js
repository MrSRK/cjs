"use strict"
const chalk=require('chalk')
const path=require('path')
const fs=require('fs')
const express=require('express')
const modules=[]
const toolbox={}
const deploy=(app,config,next)=>
{
    try
    {
        toolbox.router=express.Router()
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
                        index:modulesPath+'/'+e+'/index.js',
                    }
                    load(app,mod)
                    if(len==0)
                        return next(null,toolbox.router)
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
    if(config.routes)
        config.routes.forEach(r=>
        {
            console.log("| [%s] Attach router [%s] '%s' at controller's function %s",chalk.red(name),chalk.blue(r.method),chalk.grey(r.path),chalk.yellow(r['controller']+'()'))
            toolbox.router[r.method](r.path,controller[r['controller']])
        })
        return true
}
const load=(app,mod)=>
{
    return modules[modules.length]=require(mod.index)(toolbox,mod.name)
}
module.exports.deploy=deploy