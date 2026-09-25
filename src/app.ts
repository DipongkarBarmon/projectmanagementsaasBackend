
import express, { Application, Request, Response } from 'express'
import cors  from 'cors'
import { globalErrorHandler } from './app/middleware/globalErrorHandler'
import { notFound } from './app/middleware/notFound'
import { AuthRouter } from './app/module/auth/auth.route'
import cookieParser from 'cookie-parser'
import config from './app/config'

const app  : Application=express()
app.use(
	cors({
		origin:config.frontend_url ,
		credentials: true,
	}),
);
app.use(express.urlencoded({extended : true}))
app.use(express.raw())
app.use(express.json())
app.use(cookieParser())


app.get('/',(req : Request, res : Response)=>{
   res.send("Hello Dip!")
})

app.use('/api/v1/auth',AuthRouter)

app.use(notFound)
app.use(globalErrorHandler)

export default app
 
