"use strict"
const chalk=require('chalk')
const core=require('./core')
const loader=require('./loader')
/**
 * Vision Core Main Class
 */
const CJS=class
{
    constructor(config)
    {
        try
        {
            console.group('\n%s ------------------------------------------------------------------',chalk.bgWhite.black('→ Core Loader '))
            return core.deploy(config,(error,app)=>
            {
                if(error)
                    throw error
                console.groupEnd()
                console.group('\n%s ---------------------------------------------------------------',chalk.bgWhite.black('→ Modules Loader '))
                return loader.deploy(app,config,(error,router)=>
                {
                    if(error)
                        throw error
                    app.use(router)
                    console.groupEnd()
                    console.group('\n%s -----------------------------------------------------------',chalk.bgWhite.black('→ Application Loader '))
                    core.portListen()
                })
            })
        }
        catch(error)
        {
            console.log(chalk.red('Error'))
            console.log(error)
            console.log(chalk.red.bold('[Process Exit]'))
            process.exit(1)
        }
    }
}
module.exports=CJS