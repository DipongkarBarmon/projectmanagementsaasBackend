
import express, { Application, Request, Response } from 'express'
import cors  from 'cors'
import { globalErrorHandler } from './app/middleware/globalErrorHandler'
import { notFound } from './app/middleware/notFound'

const app  : Application=express()
// app.use(
// 	cors({
// 		origin: ,
// 		credentials: true,
// 	}),
// );
app.use(express.urlencoded({extended : true}))
app.use(express.raw())
app.use(express.json())

app.get('/',(req : Request, res : Response)=>{
   res.send("Hello Dip!")
})

app.use(notFound)
app.use(globalErrorHandler)

export default app
 
