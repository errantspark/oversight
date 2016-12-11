# Oversight
an overview tool for my projects directory

### Installation & Usage
Oversight relies by default on being a project in your projects directory, it also defaults to excluding anything that *IS* in git but *ISN'T* in my github because that gets rid of other people's repos, if you wanna fix that it's hardcoded somewhere in `main.js`
```
cd $MY_PROJECTS_DIRECTORY
git clone git@github.com:errantspark/oversight.git
cd oversight
npm install
node main.js
```

Then point a browser at `localhost:8080` and enjoy!

