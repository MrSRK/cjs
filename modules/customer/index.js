"use strict"
const constructor=(toolbox,name)=>
{
    const config=require('./config.json')
    const controller=require('./lib/controller.js')(toolbox,name)
    return toolbox.route(name,config,controller)
}
module.exports=constructor