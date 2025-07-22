/**
 * Growth Classification Logic
 * Extracted from SQL view for unit testing
 */

/**
 * Classifies a teacher's growth state based on their activity pattern
 * @param {Object} teacherData - Teacher's monthly data
 * @param {number} teacherData.monthId - Current month ID (1-48)
 * @param {number} teacherData.communicatedL28 - Whether teacher communicated in last 28 days (0 or 1)
 * @param {number|null} teacherData.prevYearSameMonth - L28 status same month last year (0, 1, or null)
 * @param {number|null} teacherData.totalActivationsBefore - Total activations before this month (number or null)
 * @returns {string} Growth state: New, Returning, Resurrected, Churned, Never_activated, Dormant, At_Risk
 */
function classifyGrowthState(teacherData) {
    const { 
        monthId, 
        communicatedL28, 
        prevYearSameMonth, 
        totalActivationsBefore 
    } = teacherData;

    // Returning: L28 this month AND L28 same month last year
    if (communicatedL28 === 1 && prevYearSameMonth === 1) {
        return 'Returning';
    }

    // New (truly new): L28 this month AND (no prior activations OR prior activations = 0)
    if (communicatedL28 === 1 && 
        (prevYearSameMonth === null || prevYearSameMonth === 0) && 
        (totalActivationsBefore === null || totalActivationsBefore === 0)) {
        return 'New';
    }

    // Resurrected: L28 this month AND previous year same month = 0 AND has prior activations > 0
    if (communicatedL28 === 1 && 
        prevYearSameMonth === 0 && 
        totalActivationsBefore > 0) {
        return 'Resurrected';
    }

    // New (new to this month): L28 this month AND no previous year same month AND has prior activations
    if (communicatedL28 === 1 && 
        prevYearSameMonth === null && 
        totalActivationsBefore > 0) {
        return 'New';
    }

    // Churned: NOT L28 this month AND L28 same month last year
    if (communicatedL28 === 0 && prevYearSameMonth === 1) {
        return 'Churned';
    }

    // Never_activated: No prior activations AND not L28 this month
    if ((totalActivationsBefore === null || totalActivationsBefore === 0) && 
        communicatedL28 === 0) {
        return 'Never_activated';
    }

    // Dormant: Not L28 this month AND has prior activations AND month_id <= 24 (first 2 years)
    if (communicatedL28 === 0 && 
        totalActivationsBefore > 0 && 
        monthId <= 24) {
        return 'Dormant';
    }

    // At_Risk: Everything else (not L28 this month AND has prior activations AND month_id > 24)
    return 'At_Risk';
}

/**
 * Helper function to create teacher data for testing
 * @param {number} monthId - Month ID (1-48)
 * @param {number} communicatedL28 - L28 status (0 or 1)
 * @param {number|null} prevYearSameMonth - Previous year same month status
 * @param {number|null} totalActivationsBefore - Total prior activations
 * @returns {Object} Teacher data object
 */
function createTeacherData(monthId, communicatedL28, prevYearSameMonth, totalActivationsBefore) {
    return {
        monthId,
        communicatedL28,
        prevYearSameMonth,
        totalActivationsBefore
    };
}

module.exports = {
    classifyGrowthState,
    createTeacherData
};