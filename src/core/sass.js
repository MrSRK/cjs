const sass=require('node-sass-middleware')
const path=require('path')
const deploy=(config,next)=>
{
	try
	{
		const options={
			outputStyle:config.sass.outputStyle||'compressed',
			src:path.join(__dirname,'../../'+config.sass.src),
			dest: path.join(__dirname,'../../'+config.sass.dest),
			maxAge:parseInt(config.sass.maxAge)||3888000,
		}
		return next(true,null,sass(options))
	}
	catch(error)
	{
		return next(false,error)
	}
}
module.exports.deploy=deploy