"use strict"
const path=require('path')
const chalk=require('chalk')
const in_array=require('in_array')
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
let app=null;
const deploy=async(config,next)=>
{
    try
    {
        // Init Express
        app=new express()
        // Set Error handler
        errorhandler.deploy((status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("| %s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Error Handler'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Error loger
        errorloger.deploy((status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("| %s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Error Logger'),chalk.magenta('Loaded successfully'))
            return true
        })
         // Set Database (MongoDB)
         database.deploy((status,error,property)=>
         {
            if(error)
                throw error
            console.log("| %s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Database'),chalk.magenta('Loaded successfully'))
            return true
         })
        // Set Body Parser (json mode)
        parser.deploy('json',(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("| %s  [%s] \t %s",chalk.green('↳'),chalk.cyan('Body Parser (json)'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Body Parser (url mode)
        parser.deploy('url',(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("| %s  [%s] \t %s",chalk.green('↳'),chalk.cyan('Body Parser (url)'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Session (MongoDB)
        session.deploy((status,error,property)=>
        {
            if(error)
                 throw error
            if(status)
                 app.use(property)
            console.log("| %s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Session'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Cookie
        cookie.deploy((status,error,property)=>
        {
            if(error)
                 throw error
            if(status)
                 app.use(property)
            console.log("| %s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Cookie'),chalk.magenta('Loaded successfully'))
            return true
        })
        // Set Security (Lusca)
        security.deploy(config,(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.get('*',(req,res,n)=>
                {
                    const exclude=[
                        '/favicon.ico',
                        '/images'
                    ]
                    if(!in_array(req.path,exclude))
                        app.use(property)
                    n()
                })
            app.disable('x-powered-by')
            console.log("| %s  [%s] \t\t %s",chalk.green('↳'),chalk.cyan('Security'),chalk.magenta('Loaded successfully'))
            return true
         })
        // Set SASS (CSS)
        sass.deploy(config,(status,error,property)=>
        {
            if(error)
                throw error
            if(status)
                app.use(property)
            console.log("| %s  [%s] \t\t\t %s",chalk.green('↳'),chalk.cyan('SASS'),chalk.magenta('Loaded successfully'))
            return true
         })
         next(null,app)
        // Static Directories
        app.use('/',express.static(path.join(__dirname,'../public')))
        app.use('/images',express.static(path.join(__dirname,'../upload/images')))
        app.use('/js/lib',express.static(path.join(__dirname,'../node_modules/angular')))
        app.use('/js/lib',express.static(path.join(__dirname,'../node_modules/angular-cookies')))
		app.use('/js/lib',express.static(path.join(__dirname,'../node_modules/popper.js/dist/umd')))
		app.use('/js/lib',express.static(path.join(__dirname,'../node_modules/bootstrap/dist/js')))
		app.use('/js/lib',express.static(path.join(__dirname,'../node_modules/jquery/dist')))
		app.use('/webfonts',express.static(path.join(__dirname,'../node_modules/@fortawesome/fontawesome-free/webfonts')))
		app.use('/favicon.ico',express.static(path.join(__dirname,'../public/images/favicon.ico')))
    }
    catch(error)
    {
        console.log(chalk.red('--Error'))
        console.log(error)
        return next(error)
    }
}
const portListen=_=>
{
    console.log('| %s Application is listening at port: %s',chalk.blue('[i]'),chalk.yellow(process.env.EXPRESS_PORT||80))
    console.log('| %s Press %s + %s to terminate it.',chalk.blue('[i]'),chalk.red('Ctrl'),chalk.red('C'))
    app.listen(process.env.EXPRESS_PORT||80)
}
module.exports.deploy=deploy
module.exports.portListen=portListen