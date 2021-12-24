module.exports = {
  "extends": [
    'airbnb-base',
    'airbnb-typescript/base'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/lines-between-class-members" : 0,
    "no-underscore-dangle": 0,
    "max-len": 0
  }
}
