"use strict"
const chalk=require('chalk');
/**
 * Vision Core Main Class
 */
const CJS=class
{
    constructor(args)
    {
        try
        {
            //Load Configuration
            //Load Core
                /*
                    Load Error parser
                    Load Error Hundler
                    Load Database
                    Load Body Parser
                    Load Session
                    Load Cookies
                    Load Security

                */
            //Load modules
            //set roots
            //set views
        }
        catch(Error)
        {
            console.log(chalk.red('Error'))
            console.log(Error)
            console.log(chalk.red.bold('[Process Exit]'))
            process.exit(1)
        }
    }
}
module.exports=CJS