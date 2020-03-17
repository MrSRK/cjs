const multer=require('multer')
const fs=require('fs')
const path=require('path')
let config={
	root:process.env.STORAGE_ROOT||'uploads/',
	subroot:'',
	name:'file'
}
/**
 * Create a store location for a file
 * @param {String} subroot Sub-root location (sub - path)
 * @param {String} name Form file name (incoming)
 * @param {Function} next Callback function
 * @callback function(error,data)
 * @throws error
 * @returns {Boolean} Function status
 */
const create=(subroot,name,next)=>
{
	try
	{
		config.subroot=subroot
		config.name=name
		const storage=multer.diskStorage(
		{
			destination:destination,
			filename:filename
		})
		return next(null,multer({storage:storage}).single(config.name))
	}
	catch(error)
	{
		return next(error)
	}
}
/**
 * Create the given destination at file system
 * @param {Object} req express req object
 * @param {String} file Form file name (incoming)
 * @param {Function} next Callback function
 * @callback function(error,data)
 * @throws error
 * @returns {Boolean} Function status
 */
 const destination=(req,file,next)=>
 {
	try
	{
		const filepath=path.join(__dirname, '../../'+config.root+config.subroot)
		return fs.exists(filepath,exists=>
		{
			if(!exists)
				return fs.mkdir(filepath,{recursive:true},error=>
				{
					if(error)
						throw(error)
					return next(null,filepath)
				})
			else
				return next(null,filepath)
		})
	}
	catch(error)
	{
		console.log(error)
		return next(error)
	}
 }
/**
 * Create the (new) file name for the (incoming) file
 * @param {Object} req express req object
 * @param {String} file Form file name (incoming)
 * @param {Function} next Callback function
 * @callback function(error,data)
 * @throws error
 * @returns {Boolean} Function status
 */
 const filename=(req,file,next)=>
 {
	try
	{
		const filepath=path.join(__dirname, '../../'+config.root+config.subroot)
		let ext=''
		if(file.originalname.lastIndexOf('.')>=0)
			ext='.'+file.originalname.split('.').reverse()[0]
		if(typeof req.files==undefined||!req.files)
			req.files={}
		var name=Date.now()+ext
		file.filename=name
		file.path=filepath+'/'+name
		req.files[config.name]=file
		return next(null,name)
	}
	catch(error)
	{
		console.log(error)
		return next(error,null)
	}
 }
 module.exports.create=create