const cookieParser=require('cookie-parser')
const deploy=next=>
{
	try
	{
		let age=process.env.COOKIE_AGE||604800000 // 7 days
		age=parseInt(age)
		const options={
			sameSite:true,
			secure:true,
			maxAge:age
		}
		return next(true,null,cookieParser(process.env.COOKIE_SECRET,options))
	}
	catch(error)
	{
		return next(false,error)
	}
}
module.exports.deploy=deploy