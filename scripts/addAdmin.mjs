import { getAdminServices } from '../lib/firebaseAdmin.js';

async function run() {
  try {
    const { adminAuth, adminDb } = await getAdminServices();
    const email = 'admin@itran.com';
    const password = 'Ittar@2026';
    
    let user;
    try {
      user = await adminAuth.getUserByEmail(email);
      console.log('User ' + email + ' already exists with UID: ' + user.uid);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        user = await adminAuth.createUser({
          email: email,
          password: password,
          emailVerified: true
        });
        console.log('Created new user ' + email + ' with UID: ' + user.uid);
      } else {
        throw e;
      }
    }
    
    await adminDb.collection('admins').doc(user.uid).set({
      role: 'admin',
      email: email,
      createdAt: new Date().toISOString()
    });
    console.log('Successfully granted admin privileges to ' + email + ' in the admins collection.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
run();
