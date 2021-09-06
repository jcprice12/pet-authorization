const merge = require('merge');
const tsPreset = require('ts-jest/jest-preset');
const dynamoDbPreset = require('jest-dynalite/jest-preset');

module.exports = merge.recursive(tsPreset, dynamoDbPreset);
