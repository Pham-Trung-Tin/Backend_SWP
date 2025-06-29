import { pool } from '../config/database.js';
import { sendError, sendSuccess } from '../utils/response.js';

const generatePlanTemplates = (cigarettesPerDay) => {
    // Helper function to round to nearest 5
    const roundToFive = (num) => Math.round(num / 5) * 5;

    // Function to generate weekly targets
    const generateWeeklyTargets = (initial, weeks, type) => {
        const targets = [];
        let currentTarget = initial;

        if (type === 'cold_turkey') {
            // Cold turkey: quit immediately
            return Array(weeks).fill().map((_, i) => ({
                week: i + 1,
                target: 0
            }));
        }

        const reduction = type === 'gradual'
            ? Math.ceil(initial / weeks)
            : Math.ceil(initial / (weeks / 2));

        for (let i = 0; i < weeks; i++) {
            currentTarget = Math.max(0, currentTarget - reduction);
            targets.push({
                week: i + 1,
                target: roundToFive(currentTarget) // Round to nearest 5
            });
        }

        return targets;
    };    // Determine plan parameters based on smoking level
    let planParameters;
    if (cigarettesPerDay < 10) {
        // Light smoker (< 10 cigarettes/day)
        planParameters = {
            gradual: {
                weeks: 6,
                name: "6-Week Gradual Plan",
                reduction: 0.25 // 25% reduction per week
            },
            quick: {
                weeks: 4,
                name: "4-Week Quick Plan",
                reduction: 0.30 // 30% reduction per week
            }
        };
    } else if (cigarettesPerDay <= 20) {
        // Moderate smoker (10-20 cigarettes/day)
        planParameters = {
            gradual: {
                weeks: 8,
                name: "8-Week Gradual Plan",
                reduction: 0.15 // 15% reduction per week
            },
            quick: {
                weeks: 6,
                name: "6-Week Quick Plan",
                reduction: 0.20 // 20% reduction per week
            }
        };
    } else {
        // Heavy smoker (>20 cigarettes/day)
        planParameters = {
            gradual: {
                weeks: 12,
                name: "12-Week Gradual Plan",
                reduction: 0.10 // 10% reduction per week
            },
            quick: {
                weeks: 8,
                name: "8-Week Quick Plan",
                reduction: 0.15 // 15% reduction per week
            }
        };
    }    // Generate two plan templates based on smoking level
    return [
        {
            name: planParameters.gradual.name,
            description: `Gradually reduce by ${planParameters.gradual.reduction * 100}% each week`,
            type: "gradual",
            totalWeeks: planParameters.gradual.weeks,
            initialCigarettes: cigarettesPerDay,
            weeks: generateWeeklyTargets(
                cigarettesPerDay,
                planParameters.gradual.weeks,
                planParameters.gradual.reduction
            ),
            recommendedFor: "Smokers who prefer a more gradual approach to quitting",
            reductionPerWeek: `${planParameters.gradual.reduction * 100}%`
        },
        {
            name: planParameters.quick.name,
            description: `Quickly reduce by ${planParameters.quick.reduction * 100}% each week`,
            type: "quick",
            totalWeeks: planParameters.quick.weeks,
            initialCigarettes: cigarettesPerDay,
            weeks: generateWeeklyTargets(
                cigarettesPerDay,
                planParameters.quick.weeks,
                planParameters.quick.reduction
            ),
            recommendedFor: "Smokers ready for a faster reduction approach",
            reductionPerWeek: `${planParameters.quick.reduction * 100}%`
        }
    ];
};

// Create a new quit plan
export const createQuitPlan = async (req, res) => {
    try {
        console.log('💡 createQuitPlan - Request body:', JSON.stringify(req.body));
        const {
            planName,
            startDate,
            initialCigarettes,
            strategy,
            goal,
            weeks,
            totalWeeks
        } = req.body;

        // Validation
        if (!planName || !startDate || !initialCigarettes || !totalWeeks) {
            console.log('❌ Missing required fields:', { planName, startDate, initialCigarettes, totalWeeks });
            return sendError(res, 'Missing required fields', 400);
        }

        const [result] = await pool.query(
            `INSERT INTO quit_smoking_plan (
                user_id, plan_name, start_date, initial_cigarettes,
                strategy, goal, weeks, total_weeks, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                planName,
                startDate,
                initialCigarettes,
                strategy,
                goal,
                JSON.stringify(weeks),
                totalWeeks,
                'active'
            ]
        );

        const [newPlan] = await pool.query(
            'SELECT * FROM quit_smoking_plan WHERE id = ?',
            [result.insertId]
        );

        return sendSuccess(res, 'Quit plan created successfully', newPlan[0], 201);
    } catch (error) {
        console.error('Create quit plan error:', error);
        return sendError(res, 'Failed to create quit plan', 500);
    }
};

// Get all quit plans for a user
export const getUserPlans = async (req, res) => {
    try {
        const [plans] = await pool.query(
            `SELECT * FROM quit_smoking_plan 
            WHERE user_id = ? 
            ORDER BY created_at DESC`,
            [req.user.id]
        );

        return sendSuccess(res, 'Quit plans retrieved successfully', plans);
    } catch (error) {
        console.error('Get user plans error:', error);
        return sendError(res, 'Failed to get quit plans', 500);
    }
};

// Get a specific quit plan by ID
export const getPlanById = async (req, res) => {
    try {
        const [plan] = await pool.query(
            `SELECT * FROM quit_smoking_plan 
            WHERE id = ? AND user_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!plan.length) {
            return sendError(res, 'Quit plan not found', 404);
        }

        return sendSuccess(res, 'Quit plan retrieved successfully', plan[0]);
    } catch (error) {
        console.error('Get plan by ID error:', error);
        return sendError(res, 'Failed to get quit plan', 500);
    }
};

// Update a quit plan
export const updatePlan = async (req, res) => {
    try {
        const {
            planName,
            startDate,
            initialCigarettes,
            strategy,
            goal,
            weeks,
            totalWeeks,
            status
        } = req.body;

        // Check if plan exists and belongs to user
        const [existingPlan] = await pool.query(
            'SELECT * FROM quit_smoking_plan WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!existingPlan.length) {
            return sendError(res, 'Quit plan not found', 404);
        }

        // Update the plan
        await pool.query(
            `UPDATE quit_smoking_plan SET
                plan_name = ?,
                start_date = ?,
                initial_cigarettes = ?,
                strategy = ?,
                goal = ?,
                weeks = ?,
                total_weeks = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?`,
            [
                planName || existingPlan[0].plan_name,
                startDate || existingPlan[0].start_date,
                initialCigarettes || existingPlan[0].initial_cigarettes,
                strategy || existingPlan[0].strategy,
                goal || existingPlan[0].goal,
                weeks ? JSON.stringify(weeks) : existingPlan[0].weeks,
                totalWeeks || existingPlan[0].total_weeks,
                status || existingPlan[0].status,
                req.params.id,
                req.user.id
            ]
        );

        const [updatedPlan] = await pool.query(
            'SELECT * FROM quit_smoking_plan WHERE id = ?',
            [req.params.id]
        );

        return sendSuccess(res, 'Quit plan updated successfully', updatedPlan[0]);
    } catch (error) {
        console.error('Update plan error:', error);
        return sendError(res, 'Failed to update quit plan', 500);
    }
};

// Delete a quit plan
export const deletePlan = async (req, res) => {
    try {
        // Check if plan exists and belongs to user
        const [existingPlan] = await pool.query(
            'SELECT * FROM quit_smoking_plan WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!existingPlan.length) {
            return sendError(res, 'Quit plan not found', 404);
        }

        // Delete the plan
        await pool.query(
            'DELETE FROM quit_smoking_plan WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        return sendSuccess(res, 'Quit plan deleted successfully');
    } catch (error) {
        console.error('Delete plan error:', error);
        return sendError(res, 'Failed to delete quit plan', 500);
    }
};

// Get quit plan templates
export const getPlanTemplates = async (req, res) => {
    try {
        console.log('💡 getPlanTemplates called - Query:', req.query);
        const cigarettesPerDay = parseInt(req.query.cigarettesPerDay) || 0;

        const generateTemplate = (type, weeks) => {
            let weeklyReduction;
            if (type === 'gradual') {
                weeklyReduction = Math.ceil(cigarettesPerDay / weeks);
            } else if (type === 'aggressive') {
                weeklyReduction = Math.ceil(cigarettesPerDay / (weeks / 2));
            }

            const template = {
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Quit Plan`,
                totalWeeks: weeks,
                strategy: type,
                initialCigarettes: cigarettesPerDay,
                weeks: []
            };

            let currentTarget = cigarettesPerDay;
            for (let i = 0; i < weeks; i++) {
                if (type === 'cold_turkey') {
                    template.weeks.push({
                        week: i + 1,
                        target: 0
                    });
                } else {
                    currentTarget = Math.max(0, currentTarget - weeklyReduction);
                    template.weeks.push({
                        week: i + 1,
                        target: currentTarget
                    });
                }
            }

            return template;
        };

        const templates = {
            light: cigarettesPerDay < 10,
            moderate: cigarettesPerDay >= 10 && cigarettesPerDay <= 20,
            heavy: cigarettesPerDay > 20
        };

        const planTemplates = [
            generateTemplate('gradual', templates.light ? 4 : templates.moderate ? 6 : 8),
            generateTemplate('aggressive', templates.light ? 2 : templates.moderate ? 3 : 4),
            generateTemplate('cold_turkey', 1)
        ];

        return sendSuccess(res, 'Plan templates generated successfully', planTemplates);
    } catch (error) {
        console.error('Get plan templates error:', error);
        return sendError(res, 'Failed to generate plan templates', 500);
    }
};
