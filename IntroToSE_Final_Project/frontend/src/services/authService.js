import api from './api';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import auth from './firebase.js';
import tokenResolver from './tokenResolver.js';

const authService = {
    register: async (email, password, name) => {
        // 1. Tạo user trong Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseToken = await userCredential.user.getIdToken();

        // 2. Gửi lên backend để đồng bộ MongoDB và lấy JWT tokens
        const response = await api.post('/auth/register', {
            token: firebaseToken,
            name,
            email,
            password
        });

        // 3. Lưu JWT tokens vào localStorage
        const { accessToken, refreshToken, user } = response.data.data;
        tokenResolver.setTokens(accessToken, refreshToken);

        // 4. Lưu user info vào localStorage
        localStorage.setItem('ml_user', JSON.stringify(user));

        // 5. Return data để App.jsx có thể update state
        return {
            user,
            accessToken,
            refreshToken
        };
    },

    loginWithEmail: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        const response = await api.post('/auth/login', {
            token,
            email,
            password
        });

        // Lưu JWT tokens vào localStorage
        const { accessToken, refreshToken, user } = response.data.data;
        tokenResolver.setTokens(accessToken, refreshToken);
        localStorage.setItem('ml_user', JSON.stringify(user));

        return response.data;
    },

    loginWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const firebaseToken = await userCredential.user.getIdToken();
        const response = await api.post('/auth/login', {
            token: firebaseToken,
            email: userCredential.user.email,
            name: userCredential.user.displayName
        });

        // Lưu JWT tokens vào localStorage
        const { accessToken, refreshToken, user } = response.data.data;
        tokenResolver.setTokens(accessToken, refreshToken);
        localStorage.setItem('ml_user', JSON.stringify(user));

        return response.data;
    }
};

export default authService;
