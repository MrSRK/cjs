"use strict"
const dotenv=require('dotenv')
dotenv.config()
var CJS=require('./src/cjs')
var config=require('./config.json')
const app=new CJS(config)