const morgan=require('morgan')
const rfs=require('rotating-file-stream')
const fs = require('fs')
const path = require('path')
const deploy=next=>
{
	try
	{
        const env=process.env.NODE_ENV||'production'
        const dir='../../'+process.env.NODE_LOG_PATH||''
        const interval=process.env.NODE_LOG_INTERVAL||'1d'
		if(env==='development')
            return next(true,null,morgan('dev'))
		const directory=path.join(__dirname,dir)
		const options={
			interval:interval,
			path:directory
		}
		fs.exists(directory,exists=>
		{
			if(!exists)
				fs.mkdir(directory,{recursive:true},error=>
				{
					if(error)
						throw(error)
					const accessLogStream=rfs.createStream('access.log',options)
					return next(true,null,morgan('combined',{stream:accessLogStream}))
				})
			else
			{
				const accessLogStream=rfs.createStream('access.log',options)
				return next(true,null,morgan('combined',{stream:accessLogStream}))
			}
		})
	}
	catch(error)
	{
		console.log(error)
		return next(false,error)
	}
}
module.exports.deploy=deploy