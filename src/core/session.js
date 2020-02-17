const session=require('express-session')
const mongoose=require('mongoose')
const MongoStore=require('connect-mongo')(session)
const deploy=next=>
{
	try
	{
		const options={
			resave:true,
			saveUninitialized:true,
			secret:process.env.SESSION_SECRET,
			store: new MongoStore(
			{
				mongooseConnection: mongoose.connection
			})
		}
		next(true,null,session(options))
	}
	catch(error)
	{
		next(false,error)
	}
}
module.exports.deploy=deploy