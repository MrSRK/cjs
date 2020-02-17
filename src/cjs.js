"use strict"
const chalk=require('chalk')
const core=require('./core')
/**
 * Vision Core Main Class
 */
const CJS=class
{
    constructor(config)
    {
        try
        {
            console.group('\n%s',chalk.bgWhite.black('→ Core Loader '))
            core.deploy(config,error=>
            {
                if(error)
                    throw error
                console.groupEnd()
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