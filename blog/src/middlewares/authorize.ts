import { NextFunction , Request, Response} from "express";
import { isValidId } from "../util/factory";

export default (req: Request, res: Response, next: NextFunction) =>{
    if(!req.session.user || !isValidId(req.session.user)) return res.status(401).json("user is unauthenticated")
    next();
}