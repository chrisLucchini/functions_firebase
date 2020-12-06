import * as admin from 'firebase-admin';
import { mapUser } from '../users/controller';
export const sendScheduleNotif = async () => {
    try{

        const fiches = await admin.firestore().collection('fiches').where('status', '==', 'aucun').get()
    
        if(fiches.size > 0){
            const listUsers = await admin.auth().listUsers();
            let users = listUsers.users.map(mapUser);
            const notif = {
                'notification': {
                    'title': '🔴 DES SAV SONT TOUJOURS EN ATTENTE',
                    'body': 'Des clients attendent toujours votre prise en charge pour leurs SAV.\nConsultez les maintenant !🔴',
                    'sound': 'default',
                    'content_available' : 'true',
                    'priority' : 'high',
                },
            };
            users = users.filter((user) => user.role === 'user');
            users.forEach(async (user)=>{
                console.log(notif.notification.title);
                console.log(user.displayName);
                await admin.messaging().sendToDevice(user.notificationToken, notif);
            })
        }
    } catch(err){
        console.log(err);
    }
    
    
}