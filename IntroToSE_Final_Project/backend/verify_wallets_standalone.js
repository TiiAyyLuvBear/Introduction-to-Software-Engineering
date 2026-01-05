import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Wallet from './models/Wallet.js';
import Invitation from './models/Invitation.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/moneylover_clone';

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

async function runTest() {
    try {
        log('Connecting to MongoDB...', colors.blue);
        await mongoose.connect(MONGODB_URI);
        log('Connected successfully.', colors.green);

        // 1. Cleanup old test data
        log('\n1. Cleaning up test data...', colors.yellow);
        await User.deleteMany({ email: { $in: ['alice_test@example.com', 'bob_test@example.com'] } });
        await Wallet.deleteMany({ name: 'Alice Test Wallet' });
        // Clean invitations related to these emails
        await Invitation.deleteMany({ inviteeEmail: { $in: ['alice_test@example.com', 'bob_test@example.com'] } });
        log('Cleanup done.', colors.green);

        // 2. Create Users
        log('\n2. Creating Users...', colors.yellow);
        const alice = await User.create({
            name: 'Alice Test',
            email: 'alice_test@example.com',
            password: 'password123',
            phoneNumber: '0901234567'
        });
        const bob = await User.create({
            name: 'Bob Test',
            email: 'bob_test@example.com',
            password: 'password123',
            phoneNumber: '0901234568'
        });
        log(`Created Alice (${alice._id}) and Bob (${bob._id})`, colors.green);

        // 3. Alice creates a wallet
        log('\n3. Alice creates a wallet...', colors.yellow);
        const wallet = await Wallet.createWallet({
            name: 'Alice Test Wallet',
            type: 'Cash',
            initialBalance: 1000000,
            currency: 'VND',
            userId: alice._id
        });
        const walletId = wallet.id; // getDisplayInfo returns id
        log(`Wallet created: ${walletId}`, colors.green);

        // 4. Check setup: Bob should NOT see this wallet yet
        log('\n4. Checking pre-share visibility...', colors.yellow);
        const bobWalletsPre = await Wallet.getUserWallets(bob._id);
        if (bobWalletsPre.find(w => w.id.toString() === walletId.toString())) {
            throw new Error('Bob should NOT see the wallet yet!');
        }
        log('Bob cannot see the wallet. Correct.', colors.green);

        // 5. Alice invites Bob
        log('\n5. Alice invites Bob...', colors.yellow);
        // We need the raw wallet document to call instance methods
        const walletDoc = await Wallet.findById(walletId);
        const invitation = await walletDoc.inviteMember(alice._id, bob.email, bob._id);
        log(`Invitation sent. Token: ${invitation.invitationToken}`, colors.green);

        // 6. Bob accepts invitation
        log('\n6. Bob accepts invitation...', colors.yellow);
        await walletDoc.respondToInvitation(invitation._id, bob._id, 'accepted');
        log('Invitation accepted.', colors.green);

        // 7. Verify: Bob should NOW see the wallet
        log('\n7. Verifying shared visibility...', colors.yellow);
        const bobWalletsPost = await Wallet.getUserWallets(bob._id);
        const sharedWallet = bobWalletsPost.find(w => w.id.toString() === walletId.toString());

        if (!sharedWallet) {
            console.log("Bob's Wallets:", JSON.stringify(bobWalletsPost, null, 2));
            throw new Error('Bob FAILED to see the shared wallet!');
        }
        log('SUCCESS: Bob can see the shared wallet!', colors.green);

        // 8. Verify Permissions (Default 'view')
        if (walletDoc.members.find(m => m.userId.toString() === bob._id.toString()).permission !== 'view') {
            throw new Error('Default permission should be view');
        }
        log('Default permission is correctly set to VIEW.', colors.green);

        // 9. Cleanup
        log('\n9. Final Cleanup...', colors.yellow);
        await User.deleteMany({ email: { $in: ['alice_test@example.com', 'bob_test@example.com'] } });
        await Wallet.deleteMany({ _id: walletId });
        await Invitation.deleteMany({ walletId: walletId });
        log('Test Data Cleaned.', colors.green);

        log('\nALL TESTS PASSED!', colors.blue);

    } catch (error) {
        log(`\nTEST FAILED: ${error.message}`, colors.red);
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
