import { Request, Response } from "express";
import * as admin from 'firebase-admin';

export async function create(req: Request, res: Response) {
   try {
       const { displayName, password, email, role } = req.body;

       if (!displayName || !password || !email || !role) {
           return res.status(400).send({ message: 'Missing fields' });
       }

       const { uid } = await admin.auth().createUser({
           displayName,
           password,
           email,
       });
       await admin.auth().setCustomUserClaims(uid, { role });

       return res.status(201).send({ uid });
   } catch (err) {
       return handleError(res, err);
   }
}

export async function all(req: Request, res: Response) {
    try {
        const listUsers = await admin.auth().listUsers();
        const users = listUsers.users.map(mapUser);
        return res.status(200).send({ users });
    } catch (err) {
        return handleError(res, err);
    }
}

function mapUser(user: admin.auth.UserRecord) {
    const customClaims = (user.customClaims || { role: '' , notificationToken: ''}) as { role?: string, notificationToken?: string };
    const role = customClaims.role ? customClaims.role : '';
    const notificationToken = customClaims.notificationToken ? customClaims.notificationToken : '';
    // console.log("Role", role);
    // console.log("NotificationToken", notificationToken);
    return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        notificationToken,
        lastSignInTime: user.metadata.lastSignInTime,
        creationTime: user.metadata.creationTime,
    };
}

export async function get(req: Request, res: Response) {
   try {
       const { id } = req.params;
       const user = await admin.auth().getUser(id);
       return res.status(200).send({ user: mapUser(user) });
   } catch (err) {
       return handleError(res, err);
   }
}

export async function patch(req: Request, res: Response) {

//    try {
//        const { id } = req.params;
//        const { displayName, password, email, role, notificationToken } = req.body;
       

//        if (!id || !displayName || !password || !email || !role) {
//            return res.status(400).send({ message: 'Missing fields' });
//        }

//        await admin.auth().updateUser(id, { displayName, password, email });
//        if(notificationToken){
//            await admin.auth().setCustomUserClaims(id, { role, notificationToken });
           
//        } else {
//             await admin.auth().setCustomUserClaims(id, { role });
//        }

//        const user = await admin.auth().getUser(id);


//        return res.status(204).send({ user: mapUser(user) });
//    } catch (err) {
//        console.log('error PATCH', err);
//        return handleError(res, err);
//    }
    try {
        const { id } = req.params;
        const { displayName, email, role, notificationToken } = req.body;
        
        console.log("NOTIFICATION TOKEN", notificationToken)

        if (!id || !displayName || !email || !role) {
            return res.status(400).send({ message: 'Missing fields' });
        }

        if(notificationToken){
            console.log("NOTIFICATION TOKEN IF", notificationToken)
            await admin.auth().setCustomUserClaims(id, { role, notificationToken });
            
        } else {
            
            await admin.auth().setCustomUserClaims(id, { role });
        }

        const user = await admin.auth().getUser(id);


        return res.status(204).send({ user: mapUser(user) });
    } catch (err) {
        console.log('error PATCH', err);
        return handleError(res, err);
    }
}
export async function editNotificationToken(req: Request, res: Response) {

    try {
        const { id } = req.params;
        const { displayName, email, role, notificationToken } = req.body;
        
        console.log("NOTIFICATION TOKEN", notificationToken)

        if (!id || !displayName || !email || !role) {
            return res.status(400).send({ message: 'Missing fields' });
        }

        if(notificationToken){
            console.log("NOTIFICATION TOKEN IF", notificationToken)
            await admin.auth().setCustomUserClaims(id, { role, notificationToken });
            
        } else {
            
            await admin.auth().setCustomUserClaims(id, { role });
        }

        const user = await admin.auth().getUser(id);


        return res.status(204).send({ user: mapUser(user) });
    } catch (err) {
        console.log('error PATCH', err);
        return handleError(res, err);
    }
}

export async function remove(req: Request, res: Response) {
   try {
       const { id } = req.params;
       await admin.auth().deleteUser(id);
       return res.status(204).send({});
   } catch (err) {
       return handleError(res, err);
   }
}

export async function sendNotif(req: Request, res: Response) {
    try {
        
        const listUsers = await admin.auth().listUsers();
        let users = listUsers.users.map(mapUser);
        users = users.filter((user)=>user.email === 'christophelucchini2a@gmail.com' || user.email === 'joseph.lucchini@gmail.com');
        const notif = {
            'notification': {
                'title': 'test',
                'body': 'test',
                'sound': 'default',
                'content_available' : 'true',
                'priority' : 'high',
            },
        };
        users.forEach(async (user)=>{
            
            if(user.notificationToken){

                await admin.messaging().sendToDevice(user.notificationToken, notif).then((resp)=> {
                    console.log('success', resp);
                })
                .catch((error)=> {
                    console.log(error);
                });
            }
        })
        return res.status(204).send({});
    } catch (err) {
        return handleError(res, err);
    }
 }

function handleError(res: Response, err: any) {
   return res.status(500).send({ message: `${err.code} - ${err.message}` });
}