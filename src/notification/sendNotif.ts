import * as admin from 'firebase-admin';
import { mapUser } from '../users/controller';
// import { mapUser } from '../users/controller';
export const sendScheduleNotif = async () => {
    try{

        const fiches = await admin.firestore().collection('fiches').where('status', '==', 'aucun').get();
    
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
export const sendRecallNotif = async () => {
    try{
        const fichesEnCours = await admin.firestore().collection('fiches').where('status', '==', 'en cours').get();
        if(fichesEnCours.size > 0){
            fichesEnCours.docs.forEach(async (f)=>{
                const ficheData = f.data();
                if(ficheData.date_rdv){
                    const dateRes = new Date(ficheData.date_rdv.seconds * 1000);
                    const dateNow = new Date();
                    if(dateRes.getFullYear() === dateNow.getFullYear() && dateRes.getMonth() === dateNow.getMonth() && dateRes.getDate() === dateNow.getDate()){
                        console.log("Recall");
                        const userDb = await admin.auth().getUser(ficheData.idPoseur);
                        const userRappel = mapUser(userDb);
                        const notifRappel = {
                            'notification': {
                                'title': "🔴 RAPPEL SAV PREVUE AUJOURD'HUI",
                                'body': `Une fiche SAV est prévue pour aujourd'hui à ${ficheData.ville_client}\nNom du client: ${ficheData.nom_client}🔴`,
                                'sound': 'default',
                                'content_available' : 'true',
                                'priority' : 'high',
                            },
                        };
                        await admin.messaging().sendToDevice(userRappel.notificationToken, notifRappel);

                    } else {
                        console.log('No recall');
                    }
                }
            });
        }
    } catch(err){
        console.log(err);
    }
    
    
}