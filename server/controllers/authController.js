const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { name, email, phone, dob, address, password, currency } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User already exists' });

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const user = await User.create({ name, email, phone, dob, address, password, currency: currency || 'BDT', verificationCode });

  if (user) {
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, verificationCode: user.verificationCode, message: 'Code sent' });
  } else {
    res.status(400).json({ message: 'Invalid data' });
  }
};

const verifyUser = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (user && user.verificationCode === code) {
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, dob: user.dob, address: user.address, currency: user.currency, token: generateToken(user._id) });
  } else {
    res.status(400).json({ message: 'Invalid code' });
  }
};

const loginUser = async (req, res) => {
  const { email, password, twoFactorCode } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) return res.status(401).json({ message: 'Verify email first' });
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.twoFactorCode = code;
        await user.save();
        return res.status(200).json({ requires2FA: true });
      }
      if (user.twoFactorCode !== twoFactorCode) return res.status(400).json({ message: 'Invalid 2FA' });
      user.twoFactorCode = undefined;
      await user.save();
    }
    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, dob: user.dob, address: user.address, currency: user.currency, twoFactorEnabled: user.twoFactorEnabled, token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } else {
    res.status(401).json({ message: 'Invalid current password' });
  }
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.dob = req.body.dob || user.dob;
    user.address = req.body.address || user.address;
    user.currency = req.body.currency || user.currency;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, dob: updated.dob, address: updated.address, currency: updated.currency });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
};

const resendCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Not found' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = code;
  await user.save();
  res.json({ verificationCode: code });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'Not found' });
  
  // Use a 6-digit OTP for reset
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();
  res.json({ resetToken: token });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid/Expired' });
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.json({ message: 'Reset done' });
};

const toggleTwoFactor = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();
    res.json({ twoFactorEnabled: user.twoFactorEnabled });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
};

module.exports = { registerUser, verifyUser, loginUser, changePassword, updateProfile, resendCode, forgotPassword, resetPassword, toggleTwoFactor };
