const lusca=require('lusca')

const deploy=(config,next)=>
{
	try
	{
	  const options=config.lusca||{}
      return next(true,null,lusca(options))
    }
	catch(error)
	{
		return next(false,error)
	}
}
module.exports.deploy=deploy