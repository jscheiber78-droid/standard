/**
 * ESSENZA Validation Middleware
 * Validates questionnaire submission data
 */

const validator = require('validator');

/**
 * Validate questionnaire submission
 */
function validateQuestionnaire(req, res, next) {
    const data = req.body;
    const errors = [];

    // Validate personal data
    if (!data.personal) {
        errors.push('Persönliche Daten fehlen');
    } else {
        const { personal } = data;

        if (!personal.vorname || personal.vorname.trim().length < 2) {
            errors.push('Vorname ist erforderlich (mindestens 2 Zeichen)');
        }

        if (!personal.nachname || personal.nachname.trim().length < 2) {
            errors.push('Nachname ist erforderlich (mindestens 2 Zeichen)');
        }

        if (!personal.email || !validator.isEmail(personal.email)) {
            errors.push('Gültige E-Mail-Adresse ist erforderlich');
        }

        if (!['maennlich', 'weiblich', 'divers'].includes(personal.geschlecht)) {
            errors.push('Geschlecht muss angegeben werden');
        }

        // Pregnancy validation for female
        if (personal.geschlecht === 'weiblich') {
            if (!['ja', 'nein'].includes(personal.schwangerschaft)) {
                errors.push('Schwangerschaftsfrage muss bei weiblichem Geschlecht beantwortet werden');
            }
        }

        // Address validation
        if (!personal.adresse || !personal.adresse.strasse || !personal.adresse.plz || !personal.adresse.ort) {
            errors.push('Vollständige Adresse ist erforderlich');
        } else {
            if (!/^\d{5}$/.test(personal.adresse.plz)) {
                errors.push('PLZ muss 5 Ziffern haben');
            }
        }

        // Height and weight
        const groesse = parseInt(personal.groesse);
        if (isNaN(groesse) || groesse < 100 || groesse > 250) {
            errors.push('Größe muss zwischen 100 und 250 cm liegen');
        }

        const gewicht = parseInt(personal.gewicht);
        if (isNaN(gewicht) || gewicht < 30 || gewicht > 300) {
            errors.push('Gewicht muss zwischen 30 und 300 kg liegen');
        }

        // Activity level
        const aktivitaet = parseInt(personal.aktivitaet);
        if (isNaN(aktivitaet) || aktivitaet < 1 || aktivitaet > 10) {
            errors.push('Aktivitätslevel muss zwischen 1 und 10 liegen');
        }
    }

    // Validate categories
    if (!data.kategorien || !Array.isArray(data.kategorien)) {
        errors.push('Kategorien müssen angegeben werden');
    } else {
        const validCategories = [
            'mentale_gesundheit',
            'fitness',
            'stress_schlaf',
            'verdauung',
            'immunsystem',
            'haut_haare',
            'knochen_gelenke',
        ];

        const invalidCategories = data.kategorien.filter(k => !validCategories.includes(k));
        if (invalidCategories.length > 0) {
            errors.push(`Ungültige Kategorien: ${invalidCategories.join(', ')}`);
        }

        if (data.kategorien.length < 3 || data.kategorien.length > 5) {
            errors.push('Es müssen 3-5 Kategorien ausgewählt werden');
        }
    }

    // Validate lifestyle data
    if (!data.lebensstil) {
        errors.push('Lebensstil-Daten fehlen');
    } else {
        const { lebensstil } = data;

        if (!lebensstil.familie_erkrankungen) {
            errors.push('Angabe zu familiären Erkrankungen fehlt');
        }

        if (!lebensstil.familie_herzinfarkt) {
            errors.push('Angabe zu Herzinfarkt/Schlaganfall in der Familie fehlt');
        }

        if (!lebensstil.zigaretten) {
            errors.push('Angabe zum Rauchen fehlt');
        }

        if (!lebensstil.ernaehrung) {
            errors.push('Ernährungsangaben fehlen');
        }
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validierungsfehler',
            details: errors,
        });
    }

    // Sanitize data
    req.body.personal.vorname = validator.escape(data.personal.vorname.trim());
    req.body.personal.nachname = validator.escape(data.personal.nachname.trim());
    req.body.personal.email = validator.normalizeEmail(data.personal.email);
    req.body.personal.adresse.strasse = validator.escape(data.personal.adresse.strasse.trim());
    req.body.personal.adresse.ort = validator.escape(data.personal.adresse.ort.trim());

    next();
}

/**
 * Validate slider values (1-10 range)
 */
function validateSliderValue(value, min = 1, max = 10) {
    const num = parseInt(value);
    return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate percentage values (0-100 range)
 */
function validatePercentage(value) {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && num <= 100;
}

module.exports = {
    validateQuestionnaire,
    validateSliderValue,
    validatePercentage,
};
