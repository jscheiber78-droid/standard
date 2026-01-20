/**
 * ESSENZA Questionnaire Model
 * MongoDB Schema for storing questionnaire submissions
 */

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    strasse: { type: String, required: true },
    plz: { type: String, required: true },
    ort: { type: String, required: true },
}, { _id: false });

const personalSchema = new mongoose.Schema({
    vorname: { type: String, required: true },
    nachname: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    geschlecht: { type: String, enum: ['maennlich', 'weiblich', 'divers'], required: true },
    schwangerschaft: { type: String, enum: ['ja', 'nein', 'nicht_zutreffend'], default: 'nicht_zutreffend' },
    adresse: { type: addressSchema, required: true },
    groesse: { type: Number, required: true, min: 100, max: 250 },
    gewicht: { type: Number, required: true, min: 30, max: 300 },
    aktivitaet: { type: Number, required: true, min: 1, max: 10 },
}, { _id: false });

const categoryAnswersSchema = new mongoose.Schema({
    mentale_gesundheit: {
        konzentration: Number,
        vergessen: Number,
        muede: Number,
        laune: Number,
    },
    fitness: {
        sportlicher: Number,
        erholung: Number,
        kraempfe: Number,
        fluessigkeit: Number,
        haeufigkeit: Number,
        wettkampf: Number,
    },
    stress_schlaf: {
        schlaf_probleme: Number,
        aufstehen: Number,
        stress_level: Number,
        ausgebrannt: Number,
    },
    immunsystem: {
        krank: Number,
        erholung: Number,
        ueberfordert: Number,
    },
    haut_haare: {
        trocken: Number,
        falten: Number,
        unrein: Number,
        haare_duenn: Number,
        naegel_bruechig: Number,
        augen_gereizt: Number,
    },
    verdauung: {
        voll: Number,
        magen: Number,
        zunehmen: Number,
        trinken: Number,
    },
    knochen_gelenke: {
        gelenk: Number,
        verspannung: Number,
        sorgen: Number,
    },
}, { _id: false });

const ernaehrungSchema = new mongoose.Schema({
    milch: { type: Number, min: 0, max: 100 },
    fisch: String,
    obst_gemuese: { type: Number, min: 0, max: 100 },
    fleisch: String,
    weizen: { type: Number, min: 0, max: 100 },
    ballaststoffe: { type: Number, min: 0, max: 100 },
}, { _id: false });

const lebensstilSchema = new mongoose.Schema({
    familie_erkrankungen: String,
    familie_herzinfarkt: String,
    zigaretten: String,
    kaffee: String,
    freien: String,
    alkohol: String,
    ernaehrung: ernaehrungSchema,
}, { _id: false });

const questionnaireSchema = new mongoose.Schema({
    // Unique submission ID
    submissionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    // Shopify customer ID (if linked)
    shopifyCustomerId: {
        type: String,
        index: true,
        sparse: true,
    },

    // Personal Information
    personal: {
        type: personalSchema,
        required: true,
    },

    // Selected Categories
    kategorien: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 3 && v.length <= 5;
            },
            message: 'Es müssen 3-5 Kategorien ausgewählt werden',
        },
    },

    // Category-specific Answers
    kategorie_antworten: categoryAnswersSchema,

    // Lifestyle
    lebensstil: lebensstilSchema,

    // Processing Status
    status: {
        type: String,
        enum: ['submitted', 'processing', 'completed', 'error'],
        default: 'submitted',
    },

    // Shopify Metafield ID (after sync)
    shopifyMetafieldId: String,

    // Email sent flag
    confirmationEmailSent: {
        type: Boolean,
        default: false,
    },

    // Source of submission
    source: {
        type: String,
        enum: ['web', 'shopify', 'api'],
        default: 'web',
    },

    // IP Address (for analytics)
    ipAddress: String,

    // User Agent
    userAgent: String,

    // Notes
    notes: String,

}, {
    timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for common queries
questionnaireSchema.index({ 'personal.email': 1 });
questionnaireSchema.index({ createdAt: -1 });
questionnaireSchema.index({ status: 1, createdAt: -1 });

// Virtual for full name
questionnaireSchema.virtual('fullName').get(function() {
    return `${this.personal.vorname} ${this.personal.nachname}`;
});

// Method to get summary
questionnaireSchema.methods.getSummary = function() {
    return {
        submissionId: this.submissionId,
        name: this.fullName,
        email: this.personal.email,
        kategorien: this.kategorien,
        status: this.status,
        createdAt: this.createdAt,
    };
};

// Static method to find by email
questionnaireSchema.statics.findByEmail = function(email) {
    return this.find({ 'personal.email': email.toLowerCase() }).sort({ createdAt: -1 });
};

// Pre-save hook for validation
questionnaireSchema.pre('save', function(next) {
    // Ensure pregnancy answer for female
    if (this.personal.geschlecht === 'weiblich' && this.personal.schwangerschaft === 'nicht_zutreffend') {
        return next(new Error('Schwangerschaftsfrage muss bei weiblichem Geschlecht beantwortet werden'));
    }
    next();
});

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);

module.exports = Questionnaire;
