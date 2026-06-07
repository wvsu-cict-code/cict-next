# CICT Website

## Get started
```bash
npm install
npm run dev
```

## Pipeline for dev
Follow these steps to ensure stable updates:
```bash
# After your changes, run linter
npx run eslint --fix . # then fix that are flagged as error

# then build to verify your changes won't crash production 
npm run build

# If no errors, you can simply now use git to push your changes
```
