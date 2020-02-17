"use strict"
const chalk=require('chalk')
const express=require('express')
const pug=require('pug')
const errorhandler=require('./core/errorhandler')
const errorloger=require('./core/errorloger')
const database=require('./core/database')
const parser=require('./core/parser')
const session=require('./core/session')
const cookie=require('./core/cookie')
const security=require('./core/security')
const sass=require('./core/sass')
const deploy=async(config,next)=>
{
    try
    {
        // Init Express
        const app=new express()
        // Set Error handler
        errorhandler.deploy((status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("%s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Error Handler'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Error loger
        errorloger.deploy((status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("%s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Error Logger'),chalk.magenta('Loaded successfully'))
            return true
        })
         // Set Database (MongoDB)
         database.deploy((status,error,property)=>
         {
            if(error)
                throw error
            console.log("%s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Database'),chalk.magenta('Loaded successfully'))
            return true
         })
        // Set Body Parser (json mode)
        parser.deploy('json',(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("%s  [%s] \t %s",chalk.green('↳'),chalk.cyan('Body Parser (json)'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Body Parser (url mode)
        parser.deploy('url',(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("%s  [%s] \t %s",chalk.green('↳'),chalk.cyan('Body Parser (url)'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Session (MongoDB)
        session.deploy((status,error,property)=>
        {
            if(error)
                 throw error
            if(status)
                 app.use(property)
            console.log("%s  [%s] \t\t\t %s",chalk.green('↳'),chalk.cyan('Session'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Cookie
        cookie.deploy((status,error,property)=>
        {
            if(error)
                 throw error
            if(status)
                 app.use(property)
            console.log("%s  [%s] \t\t\t %s",chalk.green('↳'),chalk.cyan('Cookie'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Security (Lusca)
        security.deploy(config,(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            app.disable('x-powered-by')
            console.log("%s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Security'),chalk.magenta('Loaded successfully'))
            return true
         })
        // Set SASS (CSS)
        sass.deploy(config,(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("%s  [%s] \t\t\t %s",chalk.green('↳'),chalk.cyan('SASS'),chalk.magenta('Loaded successfully'))
            return true
         })
         next()
    }
    catch(error)
    {
        console.log(chalk.red('--Error'))
        console.log(error)
        return next(error)
    }
}
module.exports.deploy=deploy