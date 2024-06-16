## git pages
```
$ npm i gh-pages
$ npm run build


// package.json

// 마지막에 이거 추가
"hompage" : "https//k1minchae.github.io/TIL"

// script 부분에 이 두개 추가
    "deploy": "gh-pages -d build",
    "predeploy": "npm run build"
$ npm run deploy
```
- build 명령어를 통해 내가 짠 코드를 최적화 해준다.
- script 부분에 해당 코드를 추가하면 명령어 하나만 입력해도 자동으로 그 다음 명령어 입력해줌

<br>

