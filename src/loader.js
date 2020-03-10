"use strict"
const chalk=require('chalk')
const path=require('path')
const fs=require('fs')
const express=require('express')
const moduleMenu=[]
const toolbox={}
const views=[path.join(__dirname,'../view')]
const controller=require('./core/controller')
let modules=[]
const deploy=(app,config,next)=>
{
	try
	{
		toolbox.router=express.Router()
		toolbox.controller=controller
		let modulesPath=path.join(__dirname,config.modules.path||'../modules')
		if(!fs.existsSync(modulesPath))
			throw new Error('Modules directory not exists')
		fs.readdir(modulesPath,(error,directories)=>
		{
			if(error)
				throw error
			let len=directories.length
			directories.forEach((e)=>
			{
				fs.lstat(modulesPath+'/'+e,(error,stat)=>
				{
					len--
					if(error)
						throw error
					if(!stat.isDirectory())
						return false
					if(!fs.existsSync(modulesPath+'/'+e+'/index.js'))
					{
						console.error('%s Module %s %s not exist',chalk.red('[ERROR]'),chalk.blue(e),chalk.yellow('[index.js]'))
						return next({name:"Error",message:'index.js not exist at module '+e})
					}
					let mod={
						name:e,
						path:modulesPath+'/'+e,
						index:modulesPath+'/'+e+'/index.js'
					}
					moduleMenu[moduleMenu.length]=mod
					views[views.length]=modulesPath+'/'+e+'/view'
					load(app,mod)
					if(len==0)
					{
						routeStaticPages(toolbox.router,config)
						return next(null,toolbox.router,views)
					}
				})
			})
		})
	}
	catch(error)
	{
		next(error)
	}
}
toolbox.route=(name,config,controller)=>
{
	// Set Routname
	let rootname=config.router.rewriteRoot||'/'+name
	rootname=rootname=='/'?'':rootname
	// Set Power Root
	let powerRoot=''
	if(config.router.powerUser)
		powerRoot='/'+config.router.powerUser
	// Add custom roots
	if(config.router.routes)
		config.router.routes.forEach(r=>
		{
			if(controller[r['controller']])
			{
				console.log("| [%s][%s] Attach router [%s] '%s' at controller's function %s",chalk.blue('CUS'),chalk.red(name),chalk.blue(r.method),chalk.grey(rootname+r.path),chalk.yellow(r['controller']+'()'))
				toolbox.router[r.method]('/'+rootname+r.path,controller[r['controller']])
			}
		})
	if(config.router.guestDefaultRoot)
	{
		const guestRoutes={
			pug:
			[
				{
					"method":"get",
					"status":200,
					"path":"",
					"controller":"pug_list"
				},
				{
					"method":"get",
					"status":200,
					"path":"/:_id",
					"controller":"pug_show"
				}
			],
			api:
			[
				{
					"method":"get",
					"status":200,
					"path":"",
					"controller":"json_find"
				},
				{
					"method":"get",
					"status":200,
					"path":"/:_id",
					"controller":"json_findById"
				}
			]
		}
		guestRoutes.pug.forEach(r=>
		{
			if(controller[r['controller']])
			{
				r.path=r.path?r.path:'/'
				console.log("| [%s][%s][%s] Attach router [%s] '%s' at controller's function %s",chalk.red('PUG'),chalk.gray('AUTH'),chalk.red(name),chalk.blue(r.method),chalk.grey(rootname+r.path),chalk.yellow(r['controller']+'()'))
				toolbox.router[r.method](rootname+r.path,controller[r['controller']])
			}
		})
		guestRoutes.api.forEach(r=>
		{
			if(controller[r['controller']])
			{
				console.log("| [%s][%s][%s] Attach router [%s] '%s' at controller's function %s",chalk.green('API'),chalk.gray('AUTH'),chalk.red(name),chalk.blue(r.method),chalk.grey('/api/'+name+r.path),chalk.yellow(r['controller']+'()'))
				toolbox.router[r.method]('/api/'+name+r.path,controller[r['controller']])
			}
		})
	}
	let userRouts={}
	if(config.router.userRoutes)
	{
		userRouts={
			pug:
			[
				{
					"method":"get",
					"status":200,
					"path":"/signIn",
					"controller":"pug_signIn"
				},
				{
					"method":"get",
					"status":200,
					"path":"/signUp",
					"controller":"pug_signUp"
				},
				{
					"method":"get",
					"status":200,
					"path":"/signOut",
					"controller":"pug_signOut"
				},
			],
			api:
			[
				{
					"method":"post",
					"status":200,
					"path":"/authentication",
					"controller":"json_authentication"
				},
				{
					"method":"post",
					"status":200,
					"path":"/token",
					"controller":"json_auth_request"
				},

			]
		}
	}
	else
		userRouts={
			pug:[],
			api:[]
		}
	let us=[]
	if(config.router.powerUser)
	{
		us.pug=userRouts.pug.concat([
			{
				"method":"get",
				"status":200,
				"path":"",
				"controller":"pug_table"
			},
			{
				"method":"get",
				"status":200,
				"path":"/update/:_id",
				"controller":"pug_edit"
			},
			{
				"method":"get",
				"status":200,
				"path":"/insert",
				"controller":"pug_new"
			},
		])
		us.api=userRouts.api.concat([
			{
				"method":"get",
				"status":200,
				"path":"/find",
				"controller":"json_auth_find"
			},
			{
				"method":"get",
				"status":200,
				"path":"/findById/:_id",
				"controller":"json_auth_findById"
			},
			{
				"method":"put",
				"status":200,
				"path":"/save",
				"controller":"json_auth_save"
			},
			{
				"method":"patch",
				"status":200,
				"path":"/findByIdAndUpdate/:_id",
				"controller":"json_auth_findByIdAndUpdate"
			},
			{
				"method":"delete",
				"status":200,
				"path":"/findByIdAndDelete/:_id",
				"controller":"json_auth_findByIdAndDelete"
			},
		])
	}
	else
		us=userRouts
	us.pug.forEach(r=>
	{
		if(controller[r['controller']])
		{
			console.log("| [%s][%s][%s] Attach router [%s] '%s' at controller's function %s",chalk.red('PUG'),chalk.gray('AUTH'),chalk.red(name),chalk.blue(r.method),chalk.grey(powerRoot+'/'+name+r.path),chalk.yellow(r['controller']+'()'))
			toolbox.router[r.method](powerRoot+'/'+name+r.path,controller[r['controller']])
		}
	})
	us.api.forEach(r=>
	{
		if(controller[r['controller']])
			if(r['controller']!='json_auth_request'&&r['controller']!='json_authentication')
			{
				console.log("| [%s][%s][%s] Attach router [%s] '%s' at controller's function %s",chalk.green('API'),chalk.green('AUTH'),chalk.red(name),chalk.blue(r.method),chalk.grey(powerRoot+'/api'+rootname+r.path),chalk.yellow(r['controller']+'()'))
				toolbox.router[r.method](powerRoot+'/api'+rootname+r.path,toolbox.controller.json_auth_check_middleware,controller[r['controller']])
			}
			else
			{
				console.log("| [%s][%s][%s] Attach router [%s] '%s' at controller's function %s",chalk.green('API'),chalk.gray('AUTH'),chalk.red(name),chalk.blue(r.method),chalk.grey(powerRoot+'/api'+rootname+r.path),chalk.yellow(r['controller']+'()'))
				toolbox.router[r.method](powerRoot+'/api'+rootname+r.path,controller[r['controller']])
			}
	})
	return true
}
const load=(app,mod)=>
{
	return modules[modules.length]=require(mod.index)(toolbox,mod.name)
}
const routeStaticPages=(router,config)=>
{
	console.log("| [%s][%s][%s] Attach router [%s] '%s'",chalk.green('API'),chalk.gray('AUTH'),chalk.red('admin'),chalk.blue('get'),chalk.grey('/admin/api'))
	let menu=[]
	moduleMenu.forEach(r=>
	{
		menu.push({
			url:r.name,
			"root-url":'/admin/'+r.name,
			name:r.name.substr(0,1).toUpperCase()+r.name.substr(1),
			title:r.name.substr(0,1).toUpperCase()+r.name.substr(1)+' Handler Page'
		})
	})
	router.get('/admin/api',toolbox.controller.json_auth_check_middleware,(req,res,next)=>
	{
		res.status(200).json(menu)
	})
	console.log("| [%s][%s][%s] Attach router [%s] '%s'",chalk.red('PUG'),chalk.gray('AUTH'),chalk.red('admin'),chalk.blue('get'),chalk.grey('/admin'))
	router.get('/admin',(req,res,next)=>
	{
		return res.status(200).render('admin',{
			title:'Admin Page',
			menu:menu
		})
	})
	console.log("| [%s][%s][%s] Attach router [%s] '%s'",chalk.red('PUG'),chalk.gray('AUTH'),chalk.red('error'),chalk.blue('get'),chalk.grey('/error'))
	router.get('/error',(req,res,next)=>
	{
		return res.status(500).render('error',{
			title:'Admin Page',
			menu:menu
		})
	})
	return true
}
module.exports.deploy=deploy