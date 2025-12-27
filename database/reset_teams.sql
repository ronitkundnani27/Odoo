-- Script to reset maintenance teams to only 3 teams
-- Run this to clean up old teams and keep only the 3 required teams

USE gearguard;

-- Step 1: Update all equipment to use one of the 3 teams temporarily
-- Get the IDs of the 3 teams we want to keep
SET @mechanical_id = (SELECT id FROM maintenance_teams WHERE name = 'Mechanical Team' LIMIT 1);
SET @technical_id = (SELECT id FROM maintenance_teams WHERE name = 'Technical Team' LIMIT 1);
SET @vehicle_id = (SELECT id FROM maintenance_teams WHERE name = 'Vehicle Team' LIMIT 1);

-- Step 2: Update equipment that uses old teams to use Mechanical Team
UPDATE equipment 
SET maintenance_team_id = @mechanical_id 
WHERE maintenance_team_id NOT IN (@mechanical_id, @technical_id, @vehicle_id);

-- Step 3: Update maintenance requests that use old teams
UPDATE maintenance_requests 
SET team_id = @mechanical_id 
WHERE team_id NOT IN (@mechanical_id, @technical_id, @vehicle_id);

-- Step 4: Remove team members from old teams
DELETE FROM team_members 
WHERE team_id NOT IN (@mechanical_id, @technical_id, @vehicle_id);

-- Step 5: Delete old teams
DELETE FROM maintenance_teams 
WHERE id NOT IN (@mechanical_id, @technical_id, @vehicle_id);

-- Verify the result
SELECT * FROM maintenance_teams;

-- You should now see only 3 teams:
-- 1. Mechanical Team
-- 2. Technical Team
-- 3. Vehicle Team
