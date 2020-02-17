"use strict"
const errorhandler=require('errorhandler')
const deploy=next=>
{
    try
    {
        const env=process.env.NODE_ENV||'production'
        if(env=='development')
            return next(true,null,errorhandler)
        return next(false)
    }
    catch(error)
    {
        return next(false,error)
    }
}
module.exports.deploy=deploy