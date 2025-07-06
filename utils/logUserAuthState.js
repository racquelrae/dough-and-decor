
export const logUserAuthState = async (user) => {
  if (!user) {
    console.log('No user object provided.');
    return;
  }
  try {
    const idToken = await user.getIdToken();
    console.log('User object:', user);
    console.log('User UID:', user.uid);
    console.log('User email:', user.email);
    console.log('User ID token:', idToken);
  } catch (e) {
    console.log('Error fetching user ID token:', e);
  }
};
