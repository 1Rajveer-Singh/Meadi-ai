// MongoDB Initialization Script for Medical AI Platform
// Creates database, collections, and indexes for optimal performance

// Switch to medical_ai_platform database
db = db.getSiblingDB('medical_ai_platform');

// Create administrative user
db.createUser({
  user: 'medical_ai_admin',
  pwd: 'medical_ai_secure_admin_2024',
  roles: [
    { role: 'readWrite', db: 'medical_ai_db' },
    { role: 'dbAdmin', db: 'medical_ai_db' }
  ]
});

// Create collections with validation schemas
print('Creating patients collection with schema validation...');
db.createCollection('patients', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['patient_id', 'personal_info', 'metadata'],
      properties: {
        patient_id: {
          bsonType: 'string',
          pattern: '^PAT_[0-9]{4}_[0-9]{6}$'
        },
        personal_info: {
          bsonType: 'object',
          required: ['name', 'age', 'gender']
        }
      }
    }
  }
});

db.createCollection('diagnoses');
db.createCollection('medical_images');
db.createCollection('ai_agents');

// Create indexes for optimal performance
print('Creating indexes for optimal query performance...');

// Patients collection indexes
db.patients.createIndex({ 'patient_id': 1 }, { unique: true });
db.patients.createIndex({ 'personal_info.name': 'text' });
db.patients.createIndex({ 'metadata.created_at': -1 });

// Diagnoses collection indexes
db.diagnoses.createIndex({ 'diagnosis_id': 1 }, { unique: true });
db.diagnoses.createIndex({ 'patient_id': 1 });
db.diagnoses.createIndex({ 'workflow.status': 1, 'metadata.created_at': -1 });

// Medical images collection indexes  
db.medical_images.createIndex({ 'image_id': 1 }, { unique: true });
db.medical_images.createIndex({ 'patient_id': 1, 'diagnosis_id': 1 });

// AI agents collection indexes
db.ai_agents.createIndex({ 'agent_id': 1 }, { unique: true });
db.ai_agents.createIndex({ 'agent_info.type': 1 });

// Insert sample AI agents configuration
print('Inserting AI agent configurations...');
db.ai_agents.insertMany([
  {
    agent_id: 'MONAI_IMG_ANALYZER_v2.1',
    agent_info: {
      name: 'MONAI Image Analysis Agent',
      version: '2.1.0',
      type: 'image_analysis',
      framework: 'MONAI'
    },
    metadata: { created_at: new Date(), status: 'active' }
  },
  {
    agent_id: 'HIST_SYNTHESIZER_v1.3',
    agent_info: {
      name: 'History Synthesis Agent',
      version: '1.3.0',
      type: 'history_synthesis'
    },
    metadata: { created_at: new Date(), status: 'active' }
  }
]);

print('Medical AI database initialization completed successfully!');
