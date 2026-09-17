import dotenv from "dotenv";
import path from "path"


const Path = path.join(process.cwd(),".env") 

dotenv.config({path:Path});

const config = {
  node_env : process.env.NODE_ENV,
  port : process.env.PORT,
  database_url : process.env.DATABASE_URL,
}

export default config



