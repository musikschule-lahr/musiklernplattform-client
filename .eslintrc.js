module.exports = {
  "extends": ["airbnb", "airbnb/hooks"],
  "plugins": ["react", "jsx-a11y", "graphql"],
  "settings": {
    "import/resolver": "webpack"
  },
  "rules": {
    "react/jsx-filename-extension": ["warn", { "extensions": [".js", ".jsx"] }],
    "linebreak-style": "off",
    'max-len': ["error", { "code": 120 }],
    "jsx-a11y/label-has-associated-control": 0,
    "no-underscore-dangle": 0,
    "graphql/template-strings": ["error", {
      env: 'apollo',
      schemaJson: require('./eslint/schema.json')
    }]
  },
  "env" : {
    "browser" : true
  }
}
