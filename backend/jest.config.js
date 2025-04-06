module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    maxWorkers: 1,
    setupFilesAfterEnv: ['jest-extended/all'],
    transform: {
        '^.+\\.(ts|tsx|js)$': 'ts-jest'
    },
};
