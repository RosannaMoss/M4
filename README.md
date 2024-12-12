# M4

### This project is a live chat that allows the user to chat with Tina, an AI expert in auto insurance.

### Installation

1. Clone repo
 ```
 https://github.com/RosannaMoss/M4.git
```

2.
```
npm install
```
3.
```
const genAI = new GoogleGenerativeAI(
  process.env.API_KEY || "'ENTER YOUR API"
);
```

4. Change git remote url to avoid accidently pushes to base project
```
git remote set-url origin github_username/repo_name
git remote -v # confirm the changes
```

### Packages used:
```
@google/generative-ai
express
cors
bodyparser
```

