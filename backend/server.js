import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database helper functions
const getDbPath = () => join(__dirname, '..', 'public', 'db.json');

const readDatabase = () => {
  try {
    const data = readFileSync(getDbPath(), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], leads: [], opportunities: [] };
  }
};

const writeDatabase = (data) => {
  try {
    writeFileSync(getDbPath(), JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes

// Auth routes
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDatabase();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, we'll use plain text comparison
    // In production, use bcrypt.compare(password, user.password)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Users routes
app.get('/api/users', authenticateToken, (req, res) => {
  const db = readDatabase();
  const users = db.users.map(({ password, ...user }) => user);
  res.json(users);
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
  const db = readDatabase();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.post('/api/users', [
  body('name').isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['rep', 'manager', 'admin'])
], handleValidationErrors, authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const { name, email, password, role } = req.body;

    // Check if user already exists
    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = {
      id: uuidv4(),
      name,
      email,
      password, // In production, hash this with bcrypt
      role
    };

    db.users.push(newUser);
    writeDatabase(db);

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Leads routes
app.get('/api/leads', authenticateToken, (req, res) => {
  const db = readDatabase();
  const { ownerId } = req.query;
  
  let leads = db.leads;
  if (ownerId) {
    leads = leads.filter(lead => lead.ownerId === ownerId);
  }
  
  res.json(leads);
});

app.get('/api/leads/:id', authenticateToken, (req, res) => {
  const db = readDatabase();
  const lead = db.leads.find(l => l.id === req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json(lead);
});

app.post('/api/leads', [
  body('name').isLength({ min: 1 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').isLength({ min: 1 }),
  body('status').isIn(['New', 'Contacted', 'Qualified']),
  body('ownerId').isLength({ min: 1 })
], handleValidationErrors, authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const { name, email, phone, status, ownerId } = req.body;

    // Verify owner exists
    if (!db.users.find(u => u.id === ownerId)) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    const newLead = {
      id: uuidv4(),
      name,
      email,
      phone,
      status,
      ownerId
    };

    db.leads.push(newLead);
    writeDatabase(db);

    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/leads/:id', [
  body('name').optional().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isLength({ min: 1 }),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified']),
  body('ownerId').optional().isLength({ min: 1 })
], handleValidationErrors, authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const leadIndex = db.leads.findIndex(l => l.id === req.params.id);
    
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const updatedLead = { ...db.leads[leadIndex], ...req.body };
    db.leads[leadIndex] = updatedLead;
    writeDatabase(db);

    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/leads/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const leadIndex = db.leads.findIndex(l => l.id === req.params.id);
    
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    db.leads.splice(leadIndex, 1);
    writeDatabase(db);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Opportunities routes
app.get('/api/opportunities', authenticateToken, (req, res) => {
  const db = readDatabase();
  const { ownerId, stage } = req.query;
  
  let opportunities = db.opportunities;
  if (ownerId) {
    opportunities = opportunities.filter(opp => opp.ownerId === ownerId);
  }
  if (stage) {
    opportunities = opportunities.filter(opp => opp.stage === stage);
  }
  
  res.json(opportunities);
});

app.get('/api/opportunities/:id', authenticateToken, (req, res) => {
  const db = readDatabase();
  const opportunity = db.opportunities.find(o => o.id === req.params.id);
  if (!opportunity) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json(opportunity);
});

app.post('/api/opportunities', [
  body('title').isLength({ min: 1 }),
  body('value').isNumeric(),
  body('stage').isIn(['Discovery', 'Proposal', 'Won', 'Lost']),
  body('ownerId').isLength({ min: 1 }),
  body('leadId').isLength({ min: 1 })
], handleValidationErrors, authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const { title, value, stage, ownerId, leadId } = req.body;

    // Verify owner and lead exist
    if (!db.users.find(u => u.id === ownerId)) {
      return res.status(400).json({ error: 'Owner not found' });
    }
    if (!db.leads.find(l => l.id === leadId)) {
      return res.status(400).json({ error: 'Lead not found' });
    }

    const newOpportunity = {
      id: uuidv4(),
      title,
      value: parseInt(value),
      stage,
      ownerId,
      leadId
    };

    db.opportunities.push(newOpportunity);
    writeDatabase(db);

    res.status(201).json(newOpportunity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/opportunities/:id', [
  body('title').optional().isLength({ min: 1 }),
  body('value').optional().isNumeric(),
  body('stage').optional().isIn(['Discovery', 'Proposal', 'Won', 'Lost']),
  body('ownerId').optional().isLength({ min: 1 }),
  body('leadId').optional().isLength({ min: 1 })
], handleValidationErrors, authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const opportunityIndex = db.opportunities.findIndex(o => o.id === req.params.id);
    
    if (opportunityIndex === -1) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const updatedOpportunity = { ...db.opportunities[opportunityIndex], ...req.body };
    if (req.body.value) {
      updatedOpportunity.value = parseInt(req.body.value);
    }
    
    db.opportunities[opportunityIndex] = updatedOpportunity;
    writeDatabase(db);

    res.json(updatedOpportunity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/opportunities/:id', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const opportunityIndex = db.opportunities.findIndex(o => o.id === req.params.id);
    
    if (opportunityIndex === -1) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    db.opportunities.splice(opportunityIndex, 1);
    writeDatabase(db);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats route
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  try {
    const db = readDatabase();
    const { ownerId } = req.query;
    
    let leads = db.leads;
    let opportunities = db.opportunities;
    
    if (ownerId) {
      leads = leads.filter(lead => lead.ownerId === ownerId);
      opportunities = opportunities.filter(opp => opp.ownerId === ownerId);
    }

    const stats = {
      totalLeads: leads.length,
      newLeads: leads.filter(l => l.status === 'New').length,
      contactedLeads: leads.filter(l => l.status === 'Contacted').length,
      qualifiedLeads: leads.filter(l => l.status === 'Qualified').length,
      totalOpportunities: opportunities.length,
      discoveryOpportunities: opportunities.filter(o => o.stage === 'Discovery').length,
      proposalOpportunities: opportunities.filter(o => o.stage === 'Proposal').length,
      wonOpportunities: opportunities.filter(o => o.stage === 'Won').length,
      lostOpportunities: opportunities.filter(o => o.stage === 'Lost').length,
      totalValue: opportunities.reduce((sum, o) => sum + o.value, 0),
      wonValue: opportunities.filter(o => o.stage === 'Won').reduce((sum, o) => sum + o.value, 0)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
