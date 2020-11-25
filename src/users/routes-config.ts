import { Application } from "express";
import { create, all, get, patch, remove, editNotificationToken, sendNotif} from "./controller";
import { isAuthenticated } from "../auth/authenticated";
import { isAuthorized } from "../auth/authorized";

export function routesConfig(app: Application) {
   app.post('/users', [
       isAuthenticated,
       isAuthorized({ hasRole: ['admin', 'manager']}),
       create,
   ]);

   app.get('/users', [
    isAuthenticated,
    isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
    all,
]);
// get :id user
app.get('/users/:id', [
    isAuthenticated,
    isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
    get,
]);
// updates :id user
app.patch('/users/:id', [
    isAuthenticated,
    isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
    patch,
]);
app.patch('/users/notif/:id', [
    isAuthenticated,
    isAuthorized({ hasRole: ['admin', 'manager'], allowSameUser: true }),
    editNotificationToken,
]);
// deletes :id user
app.delete('/users/:id', [
    isAuthenticated,
    isAuthorized({ hasRole: ['admin', 'manager'] }),
    remove,
]);

app.get('/notif/:body', [
    isAuthenticated,
    isAuthorized({ hasRole: ['admin', 'manager', 'user'], allowSameUser: true }),
    sendNotif,
]);
}