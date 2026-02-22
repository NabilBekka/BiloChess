require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helpers
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateUserId = async () => {
  let uniqueId, exists = true;
  while (exists) {
    uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const result = await pool.query('SELECT id FROM users WHERE user_id = $1', [uniqueId]);
    exists = result.rows.length > 0;
  }
  return uniqueId;
};

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Bilo Chess" <${process.env.SMTP_USER}>`,
      to, subject, html
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Format user for response (shared helper)
const formatUser = (user) => ({
  id: user.id,
  identifiant: user.user_id,
  email: user.email,
  firstname: user.firstname,
  lastname: user.lastname,
  username: user.username,
  birthDate: user.birth_date,
  emailVerified: user.email_verified,
  createdAt: user.created_at
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Bilo Chess API ♟️', status: 'running' });
});

// ═══ REGISTER ═══
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstname, lastname, username, birthDate } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Format email invalide' });

    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname))
      return res.status(400).json({ error: 'Prénom et nom doivent contenir uniquement des lettres' });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?!.*\s).{8,}$/;
    if (!passwordRegex.test(password))
      return res.status(400).json({ error: '8+ caractères, majuscule, minuscule, caractère spécial requis' });

    const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) return res.status(400).json({ error: 'Email déjà utilisé' });

    const usernameExists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (usernameExists.rows.length > 0) return res.status(400).json({ error: 'Pseudo déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const uniqueUserId = await generateUserId();

    const result = await pool.query(
      `INSERT INTO users (user_id, email, password, firstname, lastname, username, birth_date, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())
       RETURNING id, user_id, email, firstname, lastname, username, birth_date, email_verified, created_at`,
      [uniqueUserId, email, hashedPassword, firstname, lastname, username, birthDate]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    await sendEmail(email, 'Bienvenue sur Bilo Chess ! ♟️', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">♟️ Bienvenue sur Bilo Chess !</h2>
        <p>Bonjour ${firstname},</p>
        <p>Merci d'avoir rejoint Bilo Chess ! Nous sommes ravis de vous accueillir.</p>
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <strong style="color: #B45309;">⚠️ Important :</strong>
          <p style="margin: 8px 0 0 0; color: #92400E;">Veuillez vérifier votre email dans les <strong>6 jours</strong> pour garder votre compte actif. Allez dans Paramètres pour vérifier.</p>
        </div>
        <p>Prêt à progresser aux échecs ?</p>
        <p>L'équipe Bilo Chess</p>
      </div>
    `);

    res.status(201).json({ message: 'Compte créé', user: formatUser(user), token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ LOGIN ═══
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const token = generateToken(user);
    res.json({ message: 'Connexion réussie', user: formatUser(user), token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ GOOGLE AUTH ═══
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential Google requis' });

    let googleId, email, given_name, family_name;

    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();
      googleId = payload.sub; email = payload.email; given_name = payload.given_name; family_name = payload.family_name;
    } catch {
      try {
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${credential}`);
        if (!response.ok) throw new Error('Invalid token');
        const userInfo = await response.json();
        googleId = userInfo.sub; email = userInfo.email; given_name = userInfo.given_name; family_name = userInfo.family_name;
      } catch {
        return res.status(401).json({ error: 'Token Google invalide' });
      }
    }

    const result = await pool.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = $1, email_verified = true WHERE id = $2', [googleId, user.id]);
      }
      const token = generateToken(user);
      return res.json({ message: 'Connexion réussie', user: formatUser(user), token, isExistingUser: true });
    }

    res.json({
      message: 'Veuillez compléter l\'inscription',
      googleData: { googleId, email, firstname: given_name || '', lastname: family_name || '' },
      isExistingUser: false
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Token Google invalide' });
  }
});

// ═══ GOOGLE REGISTER ═══
app.post('/api/auth/google/register', async (req, res) => {
  try {
    const { googleId, email, firstname, lastname, username, password, birthDate } = req.body;
    if (!googleId || !email) return res.status(400).json({ error: 'Données Google manquantes' });

    const nameRegex = /^[a-zA-ZÀ-ÿ\s-]+$/;
    if (!nameRegex.test(firstname) || !nameRegex.test(lastname))
      return res.status(400).json({ error: 'Prénom et nom : lettres uniquement' });
    if (!username || username.length < 3)
      return res.status(400).json({ error: 'Pseudo : 3 caractères minimum' });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?!.*\s).{8,}$/;
    if (!passwordRegex.test(password))
      return res.status(400).json({ error: '8+ caractères, majuscule, spécial requis' });
    if (!birthDate) return res.status(400).json({ error: 'Date de naissance requise' });

    const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailExists.rows.length > 0) return res.status(400).json({ error: 'Email déjà utilisé' });

    const usernameExists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (usernameExists.rows.length > 0) return res.status(400).json({ error: 'Pseudo déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const uniqueUserId = await generateUserId();

    const result = await pool.query(
      `INSERT INTO users (user_id, email, password, firstname, lastname, username, birth_date, google_id, email_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
       RETURNING id, user_id, email, firstname, lastname, username, birth_date, google_id, email_verified, created_at`,
      [uniqueUserId, email, hashedPassword, firstname, lastname, username, birthDate, googleId]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    await sendEmail(email, 'Bienvenue sur Bilo Chess ! ♟️', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">♟️ Bienvenue sur Bilo Chess !</h2>
        <p>Bonjour ${firstname},</p>
        <p>Merci d'avoir rejoint Bilo Chess avec votre compte Google !</p>
        <p style="color: #10B981;">✅ Votre email est déjà vérifié.</p>
        <p>Votre identifiant unique : <strong>${user.user_id}</strong></p>
        <p>Prêt à progresser aux échecs ?</p>
        <p>L'équipe Bilo Chess</p>
      </div>
    `);

    res.status(201).json({ message: 'Compte créé', user: formatUser(user), token });
  } catch (error) {
    console.error('Google register error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ GET USER ═══
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, user_id, email, firstname, lastname, username, birth_date, email_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json({ user: formatUser(result.rows[0]) });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ UPDATE USER ═══
app.put('/api/auth/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, email, firstname, lastname, username, newPassword, birthDate } = req.body;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const currentUser = userResult.rows[0];
    const validPassword = await bcrypt.compare(currentPassword, currentUser.password);
    if (!validPassword) return res.status(401).json({ error: 'Mot de passe incorrect' });

    let updateFields = [], updateValues = [], paramCount = 1;

    if (email && email !== currentUser.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Format email invalide' });
      const exists = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (exists.rows.length > 0) return res.status(400).json({ error: 'Email déjà utilisé' });
      updateFields.push(`email = $${paramCount}`); updateValues.push(email); paramCount++;
      updateFields.push(`email_verified = false`);
    }
    if (firstname) { updateFields.push(`firstname = $${paramCount}`); updateValues.push(firstname); paramCount++; }
    if (lastname) { updateFields.push(`lastname = $${paramCount}`); updateValues.push(lastname); paramCount++; }
    if (username) {
      const exists = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
      if (exists.rows.length > 0) return res.status(400).json({ error: 'Pseudo déjà utilisé' });
      updateFields.push(`username = $${paramCount}`); updateValues.push(username); paramCount++;
    }
    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 12);
      updateFields.push(`password = $${paramCount}`); updateValues.push(hashed); paramCount++;
    }
    if (birthDate) { updateFields.push(`birth_date = $${paramCount}`); updateValues.push(birthDate); paramCount++; }

    if (updateFields.length === 0) return res.status(400).json({ error: 'Rien à mettre à jour' });

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, user_id, email, firstname, lastname, username, birth_date, email_verified, created_at`,
      updateValues
    );

    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ message: 'Profil mis à jour', user: formatUser(user), token });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ DELETE USER ═══
app.delete('/api/auth/delete', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Mot de passe incorrect' });

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    await sendEmail(user.email, 'Votre compte Bilo Chess a été supprimé', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">♟️ Bilo Chess</h2>
        <p>Bonjour ${user.firstname},</p>
        <p>Votre compte Bilo Chess a été <strong>définitivement supprimé</strong>.</p>
        <p>Toutes vos données ont été effacées.</p>
        <p>Si vous souhaitez revenir, vous pouvez créer un nouveau compte à tout moment !</p>
        <p>L'équipe Bilo Chess</p>
      </div>
    `);

    res.json({ message: 'Compte supprimé' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ SEND EMAIL VERIFICATION ═══
app.post('/api/auth/send-verification', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const user = userResult.rows[0];
    if (user.email_verified) return res.status(400).json({ error: 'Email déjà vérifié' });

    await pool.query('DELETE FROM email_verification_codes WHERE user_id = $1', [userId]);

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query('INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)', [userId, code, expiresAt]);

    const emailSent = await sendEmail(user.email, 'Vérifiez votre compte Bilo Chess', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">♟️ Bilo Chess</h2>
        <p>Bonjour ${user.firstname},</p>
        <p>Votre code de vérification :</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${code}</span>
        </div>
        <p>Ce code expire dans 15 minutes.</p>
      </div>
    `);

    if (!emailSent) return res.status(500).json({ error: 'Échec d\'envoi. Réessayez.' });
    res.json({ message: 'Code envoyé' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ VERIFY EMAIL ═══
app.post('/api/auth/verify-email', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    if (!code || code.length !== 6) return res.status(400).json({ error: 'Code invalide' });

    const codeResult = await pool.query(
      'SELECT * FROM email_verification_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW()',
      [userId, code]
    );
    if (codeResult.rows.length === 0) return res.status(400).json({ error: 'Code invalide ou expiré' });

    await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [userId]);
    await pool.query('DELETE FROM email_verification_codes WHERE user_id = $1', [userId]);

    const userResult = await pool.query(
      'SELECT id, user_id, email, firstname, lastname, username, birth_date, email_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    const token = generateToken(user);

    await sendEmail(user.email, 'Email vérifié ✅', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10B981;">✅ Email vérifié !</h2>
        <p>Bonjour ${user.firstname},</p>
        <p>Votre compte Bilo Chess est maintenant <strong>définitivement actif</strong>.</p>
        <div style="background: #f0f4ff; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #666;">Votre identifiant unique :</p>
          <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #1a1a1a;">${user.user_id}</p>
        </div>
        <p>Prêt à progresser aux échecs ? ♟️</p>
        <p>L'équipe Bilo Chess</p>
      </div>
    `);

    res.json({ message: 'Email vérifié', user: formatUser(user), token });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ FORGOT PASSWORD ═══
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.json({ message: 'Si cet email existe, un code a été envoyé' });

    const user = userResult.rows[0];
    await pool.query('DELETE FROM password_reset_codes WHERE email = $1', [email]);

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query('INSERT INTO password_reset_codes (email, code, expires_at) VALUES ($1, $2, $3)', [email, code, expiresAt]);

    await sendEmail(email, 'Réinitialiser votre mot de passe Bilo Chess', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a1a1a;">♟️ Bilo Chess</h2>
        <p>Bonjour ${user.firstname},</p>
        <p>Votre code de réinitialisation :</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${code}</span>
        </div>
        <p>Ce code expire dans 15 minutes.</p>
      </div>
    `);

    res.json({ message: 'Si cet email existe, un code a été envoyé' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ VERIFY RESET CODE ═══
app.post('/api/auth/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code || code.length !== 6) return res.status(400).json({ error: 'Email et code requis' });

    const codeResult = await pool.query(
      'SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() AND used = false',
      [email, code]
    );
    if (codeResult.rows.length === 0) return res.status(400).json({ error: 'Code invalide ou expiré' });

    res.json({ message: 'Code vérifié', valid: true });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ RESET PASSWORD ═══
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Tous les champs requis' });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(?!.*\s).{8,}$/;
    if (!passwordRegex.test(newPassword))
      return res.status(400).json({ error: '8+ caractères, majuscule, spécial requis' });

    const codeResult = await pool.query(
      'SELECT * FROM password_reset_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() AND used = false',
      [email, code]
    );
    if (codeResult.rows.length === 0) return res.status(400).json({ error: 'Code invalide ou expiré' });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
    await pool.query('UPDATE password_reset_codes SET used = true WHERE email = $1 AND code = $2', [email, code]);

    res.json({ message: 'Mot de passe réinitialisé' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ═══ CLEANUP UNVERIFIED ACCOUNTS ═══
const cleanupUnverifiedAccounts = async () => {
  try {
    const result = await pool.query(
      `SELECT id, email, firstname FROM users WHERE email_verified = false AND created_at < NOW() - INTERVAL '6 days'`
    );

    for (const user of result.rows) {
      await sendEmail(user.email, 'Votre compte Bilo Chess a été supprimé', `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #EF4444;">Compte supprimé</h2>
          <p>Bonjour ${user.firstname},</p>
          <p>Votre compte Bilo Chess a été supprimé car vous n'avez pas vérifié votre email dans les 6 jours.</p>
          <p>Vous pouvez créer un nouveau compte à tout moment.</p>
          <p>L'équipe Bilo Chess</p>
        </div>
      `);
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
      console.log(`Deleted unverified: ${user.email}`);
    }

    if (result.rows.length > 0) console.log(`Cleanup: ${result.rows.length} compte(s) supprimé(s)`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

setInterval(cleanupUnverifiedAccounts, 60 * 60 * 1000);
setTimeout(cleanupUnverifiedAccounts, 10000);

// Start
app.listen(PORT, () => {
  console.log(`
  ♟️ Bilo Chess API
  ─────────────────
  🚀 http://localhost:${PORT}
  `);
});
