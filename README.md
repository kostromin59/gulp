# Gulp - ZOOTIK build
## Start

To get started, install the `create-site` module globally `npm i -g @zootikoff/create-site`. Then run the module using `create-site`.

`gulp` - the base command for development.

`gulp build` - сollects all files for production.

`gulp zip` - collects all files to zip. Make sure to run first `gulp build`.

## Structure

```
├── src/
│   ├── js 
│   │   └── script.js 
│   ├── scss
│   │   └── components
│   │   │   └──  _footer.scss
│   │   │   └──  _header.scss
│   │   └── vendor
│   │   │   └──  normalize.css
│   │   └── _mixins.scss
│   │   └── _reset.scss
│   │   └── _variables.scss
│   │   └── style.scss
│   ├── img
│   │   └── svg (For sprite)
│   │   └── logo.jpg
│   ├── fonts
│   ├── components
│   │   └── fonts.html
│   │   └── head.html
│   │   └── start.html
│   ├── index.html
└── .editorconfig
└── .eslintrc.json
└── .gitignore
└── gulpfile.js
└── .package.json
└── .README.md
```

## Snippets

`burger` - burger button.
`navigation` - navigation.