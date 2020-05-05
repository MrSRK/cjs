"use strict"
const {model,schema}=require('./model')
const controller=(toolbox,name)=>
{
	const route={}
	const defaultRoutes={
		pug:
		[
			'pug_list',
			'pug_show',
			'pug_signIn',
			'pug_sighUp',
			'pug_signOut',
			'pug_table',
			'pug_edit',
			'pug_new',
		],
		api:
		[
			'json_schema',
			'json_find',
			'json_findById',
			'json_authentication',
			'json_auth_request',
			'json_auth_check',
			'json_auth_find',
			'json_auth_findById',
			'json_auth_save',
			'json_auth_save_image',
			'json_auth_remove_image',
			'json_auth_findByIdAndUpdate',
			'json_auth_findByIdAndDelete'
		]
	}
	defaultRoutes.pug.forEach(f=>
	{
		route[f]=(req,res)=>
		{
			return toolbox.controller.pug[f](toolbox,model,schema,name,req,res)
		}
	})
	defaultRoutes.api.forEach(f=>
	{
		route[f]=(req,res)=>
		{
			return toolbox.controller.api[f](toolbox,model,schema,name,req,res)
		}
	})
	return route
}
module.exports=controller