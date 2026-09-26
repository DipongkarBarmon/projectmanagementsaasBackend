import express from 'express';
import cors from 'cors';
import { globalErrorHandler } from './app/middleware/globalErrorHandler';
import { notFound } from './app/middleware/notFound';
import { AuthRouter } from './app/module/auth/auth.route';
import cookieParser from 'cookie-parser';
import config from './app/config';
import { InvitationRouter } from './app/module/invitation/invitation.route';
import { OrganizationRouter } from './app/module/organization/organization.route';
const app = express();
app.use(cors({
    origin: config.frontend_url,
    credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw());
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send("Hello Dip!");
});
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/invitations', InvitationRouter);
app.use('/api/v1/organizations', OrganizationRouter);
app.use(notFound);
app.use(globalErrorHandler);
export default app;
