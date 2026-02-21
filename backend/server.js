const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Contact Schema
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    service: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'completed'],
        default: 'new'
    }
});

const Contact = mongoose.model('Contact', contactSchema);

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize default admin user
async function initializeAdmin() {
    try {
        const adminExists = await User.findOne({ email: 'admin123@gmail.com' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                email: 'admin123@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('✅ Default admin account created');
        }
    } catch (error) {
        console.error('❌ Error initializing admin:', error);
    }
}

// Call initializeAdmin when DB connects
mongoose.connection.once('open', () => {
    initializeAdmin();
});

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Helper function to send email
async function sendEmailNotification(contactData) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `New Contact Form Submission - ${contactData.service}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #2d8659; border-radius: 10px;">
                <h2 style="color: #2d8659; text-align: center;">New Contact Form Submission</h2>
                <p style="font-size: 14px; color: #666; text-align: center;">Rachna Guardian Care - ${new Date().toLocaleString()}</p>
                <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold; width: 30%; border: 1px solid #ddd;">Name:</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${contactData.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Email:</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">
                            <a href="mailto:${contactData.email}" style="color: #2d8659; text-decoration: none;">${contactData.email}</a>
                        </td>
                    </tr>
                    <tr style="background-color: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Phone:</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">
                            <a href="tel:${contactData.phone}" style="color: #2d8659; text-decoration: none;">${contactData.phone}</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold; border: 1px solid #ddd;">Service:</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${contactData.service}</td>
                    </tr>
                    <tr style="background-color: #f5f5f5;">
                        <td style="padding: 12px; font-weight: bold; border: 1px solid #ddd; vertical-align: top;">Message:</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${contactData.message}</td>
                    </tr>
                </table>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-radius: 5px; text-align: center;">
                    <p style="margin: 0; color: #2d8659; font-weight: bold;">🔔 Please respond within 24 hours</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Email notification sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return false;
    }
}

// API Routes
// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Healthcare backend is running',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ==== AUTHENTICATION ROUTES ====

// User Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Error during signup:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Error during login:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message
        });
    }
});

// Check if user is authenticated
app.get('/api/auth/check', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Submit contact form
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !service || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create new contact document
        const contact = new Contact({
            name,
            email,
            phone,
            service,
            message
        });

        // Save to database
        await contact.save();
        console.log('✅ Contact saved to database:', contact._id);

        // Send email notification
        const emailSent = await sendEmailNotification({
            name,
            email,
            phone,
            service,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            data: {
                id: contact._id,
                emailSent
            }
        });

    } catch (error) {
        console.error('❌ Error processing contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing your request',
            error: error.message
        });
    }
});

// Get all contacts (for admin/dashboard)
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ submittedAt: -1 })
            .limit(100);

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        console.error('❌ Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts',
            error: error.message
        });
    }
});

// Get single contact by ID
app.get('/api/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error('❌ Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact',
            error: error.message
        });
    }
});

// Update contact status
app.patch('/api/contacts/:id', async (req, res) => {
    try {
        const { status } = req.body;
        
        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated',
            data: contact
        });
    } catch (error) {
        console.error('❌ Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact',
            error: error.message
        });
    }
});

// ==== ADMIN PANEL ROUTES ====

// Middleware to verify admin
function verifyAdmin(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
}

// Get all users (Admin only)
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Get all queries/contacts (Admin only)
app.get('/api/admin/queries', verifyAdmin, async (req, res) => {
    try {
        const queries = await Contact.find().sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: queries.length,
            data: queries
        });
    } catch (error) {
        console.error('❌ Error fetching queries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching queries',
            error: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running on port ${PORT}`);
    console.log(`📍 API endpoint: http://localhost:${PORT}/api/contact`);
    console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}\n`);
});
