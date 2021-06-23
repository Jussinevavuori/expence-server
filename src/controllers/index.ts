import { Router } from "express";

export const pingRouter = Router();
export const authRouter = Router();
export const profileRouter = Router();
export const avatarRouter = Router();
export const transactionsRouter = Router();
export const categoriesRouter = Router();
export const configurationRouter = Router();
export const stripeRouter = Router();
export const budgetsRouter = Router();
export const feedbackRouter = Router();
export const logsRouter = Router();
export const schedulesRouter = Router();

import "./ping/ping";

import "./auth/login";
import "./auth/logout";
import "./auth/register";
import "./auth/googleOauth";
import "./auth/confirm_email";
import "./auth/refresh_token";
import "./auth/reset_password";
import "./auth/change_password.get";
import "./auth/change_password.post";
import "./auth/request_confirm_email";

import "./profile/profile.get";
import "./profile/profile.patch";

import "./avatar/avatar.post";
import "./avatar/avatar.delete";
import "./avatar/avatar.put";

import "./categories/categories.get";

import "./transactions/transactions.get";
import "./transactions/transactions.[id].get";
import "./transactions/transactions.post";
import "./transactions/transactions.put";
import "./transactions/transactions.patch";
import "./transactions/transactions.delete";

import "./transactions/mass/transactions.mass.post";
import "./transactions/mass/transactions.mass.delete";

import "./configuration/configuration.get";
import "./configuration/configuration.patch";

import "./stripe/webhook.post";
import "./stripe/products.get";
import "./stripe/create_checkout_session.post";
import "./stripe/create_billing_portal_session.post";

import "./budgets/budgets.get";
import "./budgets/budgets.[id].get";
import "./budgets/budgets.post";
import "./budgets/budgets.delete";
import "./budgets/budgets.patch";
import "./budgets/budgets.put";

import "./feedback/feedback.post";

import "./logs/logs.post";

import "./schedules/schedules.get";
import "./schedules/schedules.post";
import "./schedules/schedules.patch";
import "./schedules/schedules.delete";
import "./schedules/create_scheduled.post";
